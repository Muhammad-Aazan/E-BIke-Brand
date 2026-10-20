import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import { authLimiter } from '../../common/middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validators';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), authController.register);
authRouter.post('/login', authLimiter, validate(loginSchema), authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
authRouter.get('/me', authenticate, authController.me);
