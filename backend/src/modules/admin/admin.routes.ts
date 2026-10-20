import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate, authorize } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import {
  updateOrderStatusSchema,
  addShipmentDetailsSchema,
  adjustStockSchema,
  updateCustomerStatusSchema,
} from './admin.validators';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize('admin'));

// Orders
adminRouter.get('/orders', adminController.getOrders);
adminRouter.patch(
  '/orders/:orderNumber/status',
  validate(updateOrderStatusSchema),
  adminController.updateOrderStatus
);
adminRouter.post(
  '/orders/:orderNumber/shipment',
  validate(addShipmentDetailsSchema),
  adminController.addShipmentDetails
);
adminRouter.post('/orders/:orderNumber/confirm-cod', adminController.confirmCodOrder);

// Customers
adminRouter.get('/customers', adminController.getCustomers);
adminRouter.patch(
  '/customers/:id/status',
  validate(updateCustomerStatusSchema),
  adminController.updateCustomerStatus
);

// Stock Adjustments
adminRouter.post('/inventory/adjust', validate(adjustStockSchema), adminController.adjustStock);

// Audit Logs
adminRouter.get('/audit-logs', adminController.getAuditLogsHandler);
