import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service';
import { successResponse } from '../../common/utils/response';

export async function stripeWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.body;

    const result = await paymentService.processStripeWebhook(rawBody, signature);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = await paymentService.getPaymentStatus(req.params.orderNumber as string);
    successResponse(res, { paymentStatus: status });
  } catch (err) {
    next(err);
  }
}

export async function refundPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await paymentService.processRefund({
      orderNumber: req.params.orderNumber as string,
      amount: req.body.amount,
      reason: req.body.reason,
      adminUserId: req.user!.userId,
      ipAddress: req.ip,
    });
    successResponse(res, result, { message: 'Refund successfully processed' });
  } catch (err) {
    next(err);
  }
}
