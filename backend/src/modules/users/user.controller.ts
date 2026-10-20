import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { successResponse } from '../../common/utils/response';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getProfile(req.user!.userId);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function getAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const addresses = await userService.getAddresses(req.user!.userId);
    successResponse(res, { addresses });
  } catch (err) {
    next(err);
  }
}

export async function addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.addAddress(req.user!.userId, req.body);
    successResponse(res, { addresses: user.addresses }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.updateAddress(
      req.user!.userId,
      req.params.addressId as string,
      req.body
    );
    successResponse(res, { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.deleteAddress(req.user!.userId, req.params.addressId as string);
    successResponse(res, { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}

export async function getOrderHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(20, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    const result = await userService.getOrderHistory(req.user!.userId, page, limit);
    successResponse(res, { orders: result.orders }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getOrderDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await userService.getOrderDetail(req.user!.userId, req.params.orderNumber as string);
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}
