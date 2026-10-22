import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { getAuditLogs } from '../audit/audit.service';
import { successResponse } from '../../common/utils/response';

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await adminService.getOrders(page, limit, { status, search });
    successResponse(res, { orders: result.orders }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const order = await adminService.updateOrderStatus(
      req.params.orderNumber as string,
      req.body,
      req.user!.userId,
      req.ip
    );
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}

export async function addShipmentDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const order = await adminService.addShipmentDetails(
      req.params.orderNumber as string,
      req.body,
      req.user!.userId,
      req.ip
    );
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}

export async function confirmCodOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const order = await adminService.confirmCodOrder(
      req.params.orderNumber as string,
      req.user!.userId,
      req.ip
    );
    successResponse(res, { order }, { message: 'COD order confirmed' });
  } catch (err) {
    next(err);
  }
}

export async function getCustomers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;

    const result = await adminService.getCustomers(page, limit, search, role);
    successResponse(res, { customers: result.customers }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomerStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customer = await adminService.updateCustomerStatus(
      req.params.id as string,
      req.body,
      req.user!.userId,
      req.ip
    );
    successResponse(res, { customer });
  } catch (err) {
    next(err);
  }
}

export async function adjustStock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await adminService.adjustStock(req.body, req.user!.userId, req.ip);
    successResponse(res, null, { message: 'Stock successfully adjusted' });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const result = await getAuditLogs(page, limit);
    successResponse(res, { logs: result.logs }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}
