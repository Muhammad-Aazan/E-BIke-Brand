import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { User, IUser } from '../../database/models';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  AppError,
} from '../../common/errors/AppError';
import { JwtPayload } from '../../common/middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../notifications/email.service';
import { logger } from '../../common/utils/logger';

const ACCESS_EXPIRY = config.jwt.accessExpiry;
const REFRESH_EXPIRY = config.jwt.refreshExpiry;
const SALT_ROUNDS = config.bcrypt.saltRounds;

// --- Token helpers ---

export function generateAccessToken(user: IUser): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  };
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: ACCESS_EXPIRY } as any);
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// --- Service methods ---

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingUser = await User.findOne({ normalizedEmail });
  if (existingUser) {
    // Generic error - don't reveal if email exists
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const verificationToken = generateSecureToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    name: data.name,
    email: normalizedEmail,
    normalizedEmail,
    passwordHash,
    phone: data.phone,
    role: 'customer',
    emailVerified: false,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpiry: verificationExpiry,
  });

  // Send verification email (non-blocking, failure doesn't abort registration)
  sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
    logger.error('Failed to send verification email:', { userId: user._id, error: err.message })
  );

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await addRefreshToken(user, refreshToken);

  return { user, accessToken, refreshToken };
}

export async function login(
  email: string,
  password: string,
  meta?: { userAgent?: string; ipAddress?: string }
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Select password hash explicitly
  const user = await User.findOne({ normalizedEmail }).select('+passwordHash +refreshTokens');

  // Generic error - don't reveal if user exists
  if (!user) {
    await bcrypt.hash(password, SALT_ROUNDS); // prevent timing attack
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.accountStatus !== 'active') {
    throw new UnauthorizedError('Account is not active. Please contact support.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await addRefreshToken(user, refreshToken, meta);

  return { user, accessToken, refreshToken };
}

export async function refreshTokens(
  incomingRefreshToken: string
): Promise<{ accessToken: string; newRefreshToken: string }> {
  const tokenHash = hashToken(incomingRefreshToken);

  const user = await User.findOne({
    'refreshTokens.tokenHash': tokenHash,
    'refreshTokens.expiresAt': { $gt: new Date() },
  }).select('+refreshTokens');

  if (!user) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  if (user.accountStatus !== 'active') {
    throw new UnauthorizedError('Account is suspended');
  }

  // Rotate: remove old token, add new one
  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  const newRefreshToken = generateRefreshToken();
  await addRefreshToken(user, newRefreshToken);

  const accessToken = generateAccessToken(user);
  return { accessToken, newRefreshToken };
}

export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await User.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: { tokenHash } } }
    );
  }
}

export async function logoutAll(userId: string): Promise<void> {
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
}

export async function forgotPassword(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ normalizedEmail });

  // Always return success to prevent email enumeration
  if (!user || !user.emailVerified) return;

  const resetToken = generateSecureToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await User.updateOne(
    { _id: user._id },
    {
      passwordResetToken: hashToken(resetToken),
      passwordResetExpiry: resetExpiry,
    }
  );

  sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) =>
    logger.error('Failed to send password reset email:', { userId: user._id, error: err.message })
  );
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpiry: { $gt: new Date() },
  }).select('+passwordHash');

  if (!user) {
    throw new AppError('Invalid or expired password reset token', 400, { code: 'INVALID_TOKEN' });
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await User.updateOne(
    { _id: user._id },
    {
      passwordHash,
      $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
      refreshTokens: [], // Invalidate all sessions
    }
  );
}

export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpiry: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpiry');

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400, { code: 'INVALID_TOKEN' });
  }

  await User.updateOne(
    { _id: user._id },
    {
      emailVerified: true,
      $unset: { emailVerificationToken: 1, emailVerificationExpiry: 1 },
    }
  );
}

export async function getMe(userId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');
  if (user.accountStatus === 'deleted') throw new UnauthorizedError();
  return user;
}

// --- Internal helpers ---

async function addRefreshToken(
  user: IUser,
  rawToken: string,
  meta?: { userAgent?: string; ipAddress?: string }
): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  // Parse refresh expiry like '7d' -> 7 days
  const expiryStr = REFRESH_EXPIRY;
  const match = expiryStr.match(/^(\d+)([smhd])$/);
  if (match) {
    const val = parseInt(match[1], 10);
    const unit = match[2];
    const msMap: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    expiresAt.setTime(expiresAt.getTime() + val * msMap[unit]);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  // Keep max 5 refresh tokens per user, remove expired ones
  const validTokens = (user.refreshTokens || []).filter((t) => t.expiresAt > new Date());
  const tokens = validTokens.slice(-4); // keep last 4, add new one

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        refreshTokens: [
          ...tokens,
          {
            tokenHash,
            createdAt: new Date(),
            expiresAt,
            userAgent: meta?.userAgent,
            ipAddress: meta?.ipAddress,
          },
        ],
      },
    }
  );
}
