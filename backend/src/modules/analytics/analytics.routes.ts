import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { authenticate, authorize } from '../../common/middleware/auth';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate, authorize('admin'));

analyticsRouter.get('/overview', analyticsController.getOverview);
analyticsRouter.get('/best-sellers', analyticsController.getBestSellers);
analyticsRouter.get('/low-stock', analyticsController.getLowStock);
analyticsRouter.get('/trends', analyticsController.getRevenueTrends);
