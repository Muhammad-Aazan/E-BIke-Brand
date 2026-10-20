import rateLimit from 'express-rate-limit';
import { config } from '../../config';

const createLimiter = (max: number, windowMs?: number, message?: string) =>
  rateLimit({
    windowMs: windowMs ?? config.rateLimit.windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: message ?? 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    skip: () => config.isTest,
  });

export const generalLimiter = createLimiter(config.rateLimit.general);
export const authLimiter = createLimiter(config.rateLimit.auth, 15 * 60 * 1000, 'Too many authentication attempts');
export const checkoutLimiter = createLimiter(config.rateLimit.checkout, 60 * 1000, 'Too many checkout requests');
export const searchLimiter = createLimiter(config.rateLimit.search);
