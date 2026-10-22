import { Request, Response, NextFunction } from 'express';
import { config } from '../../config';
import * as authService from './auth.service';
import { successResponse } from '../../common/utils/response';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes in ms
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });

    successResponse(res, { user, accessToken, refreshToken }, { statusCode: 201, message: 'Account created. Please verify your email.' });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body.email,
      req.body.password,
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }
    );

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });

    successResponse(res, { user, accessToken, refreshToken }, { message: 'Login successful' });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const userId = req.user?.userId;

    if (userId) {
      await authService.logout(userId, refreshToken);
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    successResponse(res, null, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
      res.status(401).json({ success: false, error: 'No refresh token provided', code: 'UNAUTHORIZED' });
      return;
    }

    const { accessToken, newRefreshToken } = await authService.refreshTokens(incomingRefreshToken);

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });

    successResponse(res, { accessToken, refreshToken: newRefreshToken }, { message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return success (prevent email enumeration)
    successResponse(res, null, {
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    // Clear all auth cookies after password reset
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    successResponse(res, null, { message: 'Password reset successful. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.verifyEmail(req.body.token);
    successResponse(res, null, { message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}
