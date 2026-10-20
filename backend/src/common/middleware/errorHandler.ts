import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { config } from '../../config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Zod request validation errors
  if (err instanceof ZodError) {
    const issues = err.issues || (err as any).errors || [];
    const details = issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    const primaryMessage = details[0]?.message || 'Validation failed';

    res.status(422).json({
      success: false,
      error: primaryMessage, // Meaningful message for toast/alert notifications
      code: 'VALIDATION_ERROR',
      details,               // Per-field messages for form field highlighting
    });
    return;
  }

  // 2. MongoDB unique constraint duplicate key
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError' && (err as any).code === 11000) {
    const rawField = Object.keys((err as any).keyPattern || {})[0] || 'field';
    const readableField =
      rawField === 'normalizedEmail' || rawField === 'email'
        ? 'email address'
        : rawField === 'sku'
          ? 'SKU'
          : rawField === 'code'
            ? 'coupon code'
            : rawField === 'slug'
              ? 'URL slug'
              : rawField;

    res.status(409).json({
      success: false,
      error: `A record with this ${readableField} already exists in the system`,
      code: 'CONFLICT',
      field: rawField,
    });
    return;
  }

  // 3. Mongoose schema validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    const primaryMessage = details[0]?.message || 'Validation failed';

    res.status(422).json({
      success: false,
      error: primaryMessage,
      code: 'VALIDATION_ERROR',
      details,
    });
    return;
  }

  // 4. JWT authentication errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token. Please log in again.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Session expired. Please log in again.',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  // 5. Operational application errors (AppError hierarchy)
  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      logger.error('Operational error:', { message: err.message, code: err.code, stack: err.stack });
    }
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // 6. Unhandled internal server errors
  logger.error('Unhandled server error:', { message: err.message, stack: err.stack, path: req.path });
  res.status(500).json({
    success: false,
    error: config.isProduction
      ? 'An unexpected error occurred. Please contact support.'
      : err.message,
    code: 'INTERNAL_SERVER_ERROR',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}. The requested endpoint does not exist.`,
    code: 'NOT_FOUND',
  });
}
