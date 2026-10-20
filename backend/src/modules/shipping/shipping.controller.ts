import { Request, Response, NextFunction } from 'express';
import * as shippingService from './shipping.service';
import { successResponse } from '../../common/utils/response';

export async function getShippingZones(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isAdmin = req.user?.role === 'admin';
    const zones = await shippingService.getShippingZones(isAdmin);
    successResponse(res, { zones });
  } catch (err) {
    next(err);
  }
}

export async function calculateShipping(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const country = (req.query.country as string) || 'PK';
    const city = req.query.city as string | undefined;
    const subtotal = parseInt((req.query.subtotal as string) || '0', 10);

    const methods = await shippingService.calculateShippingOptions(country, city, subtotal);
    successResponse(res, { methods });
  } catch (err) {
    next(err);
  }
}

export async function createShippingZone(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const zone = await shippingService.createShippingZone(req.body);
    successResponse(res, { zone }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateShippingZone(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const zone = await shippingService.updateShippingZone(req.params.id as string, req.body);
    successResponse(res, { zone });
  } catch (err) {
    next(err);
  }
}

export async function deleteShippingZone(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await shippingService.deleteShippingZone(req.params.id as string);
    successResponse(res, null, { message: 'Shipping zone deleted' });
  } catch (err) {
    next(err);
  }
}
