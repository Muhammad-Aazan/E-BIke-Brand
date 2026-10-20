import { Request, Response, NextFunction } from 'express';
import * as couponService from './coupon.service';
import { successResponse } from '../../common/utils/response';
import { validateCouponQuerySchema } from './coupon.validators';

export async function validateCoupon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code, subtotal } = validateCouponQuerySchema.parse(req.query);
    const userId = req.user?.userId;
    const result = await couponService.validateCoupon(code, subtotal || 0, userId);
    successResponse(res, { coupon: result });
  } catch (err) {
    next(err);
  }
}

export async function getCoupons(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isAdmin = req.user?.role === 'admin';
    const coupons = await couponService.getCoupons(isAdmin);
    successResponse(res, { coupons });
  } catch (err) {
    next(err);
  }
}

export async function createCoupon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const coupon = await couponService.createCoupon(req.body, req.user!.userId);
    successResponse(res, { coupon }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateCoupon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
    successResponse(res, { coupon });
  } catch (err) {
    next(err);
  }
}

export async function deleteCoupon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await couponService.deleteCoupon(req.params.id as string);
    successResponse(res, null, { message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
}
