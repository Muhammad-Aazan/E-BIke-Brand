import mongoose from 'mongoose';
import {
  Order,
  User,
  IOrder,
  IUser,
  OrderStatus,
} from '../../database/models';
import { NotFoundError, AppError, ValidationError } from '../../common/errors/AppError';
import { paginationMeta, PaginationMeta } from '../../common/utils/response';
import { logAction } from '../audit/audit.service';
import { adjustInventory } from '../inventory/inventory.service';
import { releaseOrderReservations } from '../inventory/inventory.service';
import { sendShipmentEmail, sendCancellationEmail } from '../notifications/email.service';
import {
  UpdateOrderStatusInput,
  AddShipmentDetailsInput,
  AdjustStockInput,
  UpdateCustomerStatusInput,
} from './admin.validators';
import { logger } from '../../common/utils/logger';

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['confirmed', 'processing', 'ready_to_ship', 'cancelled'],
  confirmed: ['processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'],
  processing: ['ready_to_ship', 'shipped', 'delivered', 'cancelled'],
  ready_to_ship: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['partially_refunded', 'refunded'],
  cancelled: ['pending_payment', 'confirmed'],
  partially_refunded: ['refunded'],
  refunded: [],
};

export async function getOrders(
  page = 1,
  limit = 20,
  filterQuery: { status?: string; search?: string } = {}
): Promise<{ orders: IOrder[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {};

  if (filterQuery.status) {
    filter.orderStatus = filterQuery.status;
  }

  if (filterQuery.search) {
    filter.$or = [
      { orderNumber: { $regex: filterQuery.search, $options: 'i' } },
      { guestEmail: { $regex: filterQuery.search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: filterQuery.search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: filterQuery.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, meta: paginationMeta(page, limit, total) };
}

export async function updateOrderStatus(
  orderNumber: string,
  input: UpdateOrderStatusInput,
  adminUserId: string,
  ipAddress?: string
): Promise<IOrder> {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError('Order');

  // If already at the requested status, simply add note if provided and return
  if (order.orderStatus === input.status) {
    if (input.note) {
      order.statusHistory.push({
        status: input.status as OrderStatus,
        timestamp: new Date(),
        note: input.note,
        updatedBy: new mongoose.Types.ObjectId(adminUserId),
      });
      await order.save();
    }
    return order;
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.orderStatus] || [];
  if (!allowedTransitions.includes(input.status as OrderStatus)) {
    throw new ValidationError(
      `Cannot transition order from '${order.orderStatus}' to '${input.status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`
    );
  }

  const prevStatus = order.orderStatus;
  order.orderStatus = input.status as OrderStatus;

  // If transitioning to confirmed, also update paymentStatus if still pending
  if (input.status === 'confirmed' && order.paymentStatus === 'pending') {
    order.paymentStatus = 'paid';
  }

  order.statusHistory.push({
    status: input.status as OrderStatus,
    timestamp: new Date(),
    note: input.note || `Status updated to ${input.status} by admin`,
    updatedBy: new mongoose.Types.ObjectId(adminUserId),
  });

  if (input.status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancellationReason = input.note || 'Cancelled by admin';
    await releaseOrderReservations(order.items);
  } else if (input.status === 'delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();

  await logAction({
    action: 'ORDER_STATUS_UPDATE',
    entity: 'Order',
    entityId: order._id.toString(),
    performedBy: adminUserId,
    performedByRole: 'admin',
    ipAddress,
    changes: {
      before: { orderStatus: prevStatus },
      after: { orderStatus: input.status },
    },
    metadata: { orderNumber, note: input.note },
  });

  return order;
}

export async function addShipmentDetails(
  orderNumber: string,
  input: AddShipmentDetailsInput,
  adminUserId: string,
  ipAddress?: string
): Promise<IOrder> {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError('Order');

  order.shippingCarrier = input.carrier;
  order.trackingNumber = input.trackingNumber;
  if (input.estimatedDelivery) {
    order.estimatedDelivery = new Date(input.estimatedDelivery);
  }
  order.shippedAt = new Date();
  order.orderStatus = 'shipped';

  order.statusHistory.push({
    status: 'shipped',
    timestamp: new Date(),
    note: `Dispatched via ${input.carrier} tracking #${input.trackingNumber}`,
    updatedBy: new mongoose.Types.ObjectId(adminUserId),
  });

  await order.save();

  await logAction({
    action: 'ORDER_SHIPMENT_DISPATCH',
    entity: 'Order',
    entityId: order._id.toString(),
    performedBy: adminUserId,
    performedByRole: 'admin',
    ipAddress,
    metadata: {
      orderNumber,
      carrier: input.carrier,
      trackingNumber: input.trackingNumber,
    },
  });

  if (input.notifyCustomer) {
    const recipientEmail = order.guestEmail || 'customer@evee.pk';
    const recipientName = order.guestName || order.shippingAddress.fullName;
    sendShipmentEmail(
      recipientEmail,
      recipientName,
      order.orderNumber,
      input.carrier,
      input.trackingNumber
    ).catch((err) => logger.error('Shipment notification email failed:', err));
  }

  return order;
}

export async function confirmCodOrder(
  orderNumber: string,
  adminUserId: string,
  ipAddress?: string
): Promise<IOrder> {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError('Order');

  if (order.paymentProvider !== 'cod') {
    throw new AppError('This endpoint is only for Cash on Delivery orders', 400);
  }

  order.orderStatus = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    timestamp: new Date(),
    note: 'COD order confirmed by admin after customer verification',
    updatedBy: new mongoose.Types.ObjectId(adminUserId),
  });

  await order.save();

  await logAction({
    action: 'COD_ORDER_CONFIRMATION',
    entity: 'Order',
    entityId: order._id.toString(),
    performedBy: adminUserId,
    performedByRole: 'admin',
    ipAddress,
    metadata: { orderNumber },
  });

  return order;
}

export async function getCustomers(
  page = 1,
  limit = 20,
  search?: string,
  role?: string
): Promise<{ customers: IUser[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {};
  if (role && role !== 'all') {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [customers, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-refreshTokens'),
    User.countDocuments(filter),
  ]);

  return { customers, meta: paginationMeta(page, limit, total) };
}

export async function updateCustomerStatus(
  customerId: string,
  input: UpdateCustomerStatusInput,
  adminUserId: string,
  ipAddress?: string
): Promise<IUser> {
  const customer = await User.findById(customerId);
  if (!customer) throw new NotFoundError('Customer');

  const prevStatus = customer.accountStatus;
  customer.accountStatus = input.accountStatus;
  await customer.save();

  await logAction({
    action: 'CUSTOMER_STATUS_UPDATE',
    entity: 'User',
    entityId: customer._id.toString(),
    performedBy: adminUserId,
    performedByRole: 'admin',
    ipAddress,
    changes: {
      before: { accountStatus: prevStatus },
      after: { accountStatus: input.accountStatus },
    },
    metadata: { reason: input.reason },
  });

  return customer;
}

export async function adjustStock(
  input: AdjustStockInput,
  adminUserId: string,
  ipAddress?: string
): Promise<void> {
  // Accept both `change` (from admin UI) and `quantityDelta` (canonical)
  const delta = (input as any).change ?? input.quantityDelta ?? 0;
  const note = (input as any).reason ?? input.note;

  // Fetch product sku if not provided
  let sku = input.sku;
  if (!sku) {
    const prod = await import('../../database/models').then(m => m.Product.findById(input.productId).select('sku'));
    sku = prod?.sku ?? 'UNKNOWN';
  }

  await adjustInventory({
    productId: input.productId,
    variantId: input.variantId,
    sku,
    quantityDelta: delta,
    movementType: input.movementType ?? 'adjustment',
    note,
    performedBy: adminUserId,
  });

  await logAction({
    action: 'INVENTORY_STOCK_ADJUSTMENT',
    entity: 'Product',
    entityId: input.productId,
    performedBy: adminUserId,
    performedByRole: 'admin',
    ipAddress,
    metadata: {
      sku,
      quantityDelta: delta,
      movementType: input.movementType ?? 'adjustment',
      note,
    },
  });
}
