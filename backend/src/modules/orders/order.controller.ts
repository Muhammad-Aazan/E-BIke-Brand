import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';
import { successResponse } from '../../common/utils/response';

export async function trackOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = req.query.email as string | undefined;
    const tracking = await orderService.trackOrder(req.params.orderNumber as string, email);
    successResponse(res, { tracking });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    const order = await orderService.getOrder(req.params.orderNumber as string, userId, isAdmin);
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const order = await orderService.cancelOrder(
      req.params.orderNumber as string,
      userId,
      req.body.reason
    );
    successResponse(res, { order }, { message: 'Order successfully cancelled' });
  } catch (err) {
    next(err);
  }
}
