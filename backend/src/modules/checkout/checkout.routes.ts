import { Router } from 'express';
import * as checkoutController from './checkout.controller';
import { optionalAuth } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { checkoutLimiter } from '../../common/middleware/rateLimiter';
import {
  validateCheckoutSchema,
  createOrderSchema,
  sendCheckoutOtpSchema,
  verifyCheckoutOtpSchema,
} from './checkout.validators';

export const checkoutRouter = Router();

// Send OTP code to customer email for checkout verification
checkoutRouter.post(
  '/send-otp',
  checkoutLimiter,
  validate(sendCheckoutOtpSchema),
  checkoutController.sendOtp
);

// Verify OTP code entered by customer
checkoutRouter.post(
  '/verify-otp',
  checkoutLimiter,
  validate(verifyCheckoutOtpSchema),
  checkoutController.verifyOtp
);

// Validate checkout calculations
checkoutRouter.post(
  '/validate',
  optionalAuth,
  validate(validateCheckoutSchema),
  checkoutController.validateCheckout
);

// Authoritative order creation and payment initiation
checkoutRouter.post(
  '/create-order',
  checkoutLimiter,
  optionalAuth,
  validate(createOrderSchema),
  checkoutController.createOrder
);
