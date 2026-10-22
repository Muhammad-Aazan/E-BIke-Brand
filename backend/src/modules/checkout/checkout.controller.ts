import { Request, Response, NextFunction } from 'express';
import * as checkoutService from './checkout.service';
import { successResponse } from '../../common/utils/response';

export async function sendOtp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await checkoutService.sendCheckoutOtp(req.body);
    successResponse(res, result, { message: result.message });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await checkoutService.verifyCheckoutOtp(req.body);
    successResponse(res, result, { message: result.message });
  } catch (err) {
    next(err);
  }
}

export async function validateCheckout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const summary = await checkoutService.calculateCheckout(req.body, userId);
    successResponse(res, { checkout: summary });
  } catch (err) {
    next(err);
  }
}

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const result = await checkoutService.createOrder(req.body, userId);
    successResponse(
      res,
      {
        order: result.order,
        checkoutUrl: result.checkoutUrl,
        sessionId: result.sessionId,
      },
      { statusCode: 201, message: 'Order created successfully' }
    );
  } catch (err) {
    next(err);
  }
}
