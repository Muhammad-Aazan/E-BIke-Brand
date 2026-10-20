import { Router } from 'express';
import * as orderController from './order.controller';
import { optionalAuth, authenticate } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { cancelOrderSchema } from './order.validators';

export const orderRouter = Router();

// Public order tracking
orderRouter.get('/track/:orderNumber', orderController.trackOrder);

// Authenticated or guest order detail
orderRouter.get('/:orderNumber', optionalAuth, orderController.getOrder);

// Customer self-cancellation
orderRouter.post(
  '/:orderNumber/cancel',
  authenticate,
  validate(cancelOrderSchema),
  orderController.cancelOrder
);
