import { Router } from 'express';
import * as shippingController from './shipping.controller';
import { authenticate, authorize } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import {
  createShippingZoneSchema,
  updateShippingZoneSchema,
  calculateShippingSchema,
} from './shipping.validators';

export const shippingRouter = Router();

// Public: calculate shipping fees for checkout
shippingRouter.get(
  '/calculate',
  validate(calculateShippingSchema, 'query'),
  shippingController.calculateShipping
);

// Admin: manage shipping zones
shippingRouter.get('/zones', authenticate, authorize('admin'), shippingController.getShippingZones);
shippingRouter.post(
  '/zones',
  authenticate,
  authorize('admin'),
  validate(createShippingZoneSchema),
  shippingController.createShippingZone
);
shippingRouter.patch(
  '/zones/:id',
  authenticate,
  authorize('admin'),
  validate(updateShippingZoneSchema),
  shippingController.updateShippingZone
);
shippingRouter.delete(
  '/zones/:id',
  authenticate,
  authorize('admin'),
  shippingController.deleteShippingZone
);
