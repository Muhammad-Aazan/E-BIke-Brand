import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service';
import { successResponse } from '../../common/utils/response';

export async function getOverview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const overview = await analyticsService.getDashboardOverview(startDate, endDate);
    successResponse(res, { overview });
  } catch (err) {
    next(err);
  }
}

export async function getBestSellers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt((req.query.limit as string) || '5', 10);
    const products = await analyticsService.getBestSellingProducts(limit);
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}

export async function getLowStock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const threshold = parseInt((req.query.threshold as string) || '5', 10);
    const products = await analyticsService.getLowStockProducts(threshold);
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}

export async function getRevenueTrends(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const days = parseInt((req.query.days as string) || '30', 10);
    const trends = await analyticsService.getSalesByDate(days);
    successResponse(res, { trends });
  } catch (err) {
    next(err);
  }
}
