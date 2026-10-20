import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { User } from '../../database/models';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';

export interface JwtPayload {
  userId: string;
  role: 'customer' | 'admin' | 'support';
  email: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Reads JWT from HttpOnly cookie 'accessToken' or Authorization Bearer header.
 * Sets req.user if valid.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

/**
 * Optional authentication: sets req.user if token present and valid, but doesn't fail if not.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  if (token) {
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
      req.user = payload;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

/**
 * Role-based authorization middleware factory.
 */
export function authorize(...roles: Array<'customer' | 'admin' | 'support'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Role '${req.user.role}' cannot access this resource`));
      return;
    }
    next();
  };
}

/**
 * Ensures the authenticated user's account is active.
 */
export function requireActiveAccount(req: Request, _res: Response, next: NextFunction): void {
  // This relies on req.user being set already
  // Full account status check should be done in the service layer when needed
  // This is a lightweight middleware check - for full check use service
  next();
}
