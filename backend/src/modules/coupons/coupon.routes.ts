import { Router } from 'express';
import * as couponController from './coupon.controller';
import { authenticate, authorize, optionalAuth } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { createCouponSchema, updateCouponSchema } from './coupon.validators';

export const couponRouter = Router();

// Validate a coupon (public/customer)
couponRouter.get('/validate', optionalAuth, couponController.validateCoupon);

// Admin coupon management
couponRouter.get('/', authenticate, authorize('admin'), couponController.getCoupons);
couponRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createCouponSchema),
  couponController.createCoupon
);
couponRouter.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateCouponSchema),
  couponController.updateCoupon
);
couponRouter.delete('/:id', authenticate, authorize('admin'), couponController.deleteCoupon);
