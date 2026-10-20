import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authenticate, authorize } from '../../common/middleware/auth';

export const paymentRouter = Router();

// Stripe Webhook: express.raw({ type: 'application/json' }) is already mounted in app.ts for this path
paymentRouter.post('/stripe/webhook', paymentController.stripeWebhook);

// Check authoritative payment status (used by success page)
paymentRouter.get('/:orderNumber/status', paymentController.getPaymentStatus);

// Admin refund endpoint
paymentRouter.post(
  '/:orderNumber/refund',
  authenticate,
  authorize('admin'),
  paymentController.refundPayment
);
