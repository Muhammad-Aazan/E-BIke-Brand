import { Router } from 'express';
import * as checkoutController from './checkout.controller';
import { optionalAuth } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { checkoutLimiter } from '../../common/middleware/rateLimiter';
import { validateCheckoutSchema, createOrderSchema } from './checkout.validators';

export const checkoutRouter = Router();

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
