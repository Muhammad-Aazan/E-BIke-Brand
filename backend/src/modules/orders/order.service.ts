import mongoose from 'mongoose';
import { Order, IOrder } from '../../database/models';
import { NotFoundError, UnauthorizedError, AppError } from '../../common/errors/AppError';
import { releaseOrderReservations } from '../inventory/inventory.service';
import { sendCancellationEmail } from '../notifications/email.service';
import { logger } from '../../common/utils/logger';

export async function trackOrder(orderNumber: string, email?: string): Promise<{
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  itemsSummary: Array<{ productName: string; quantity: number }>;
  createdAt: Date;
}> {
  if (mongoose.connection.readyState !== 1) {
    throw new NotFoundError('Order');
  }
  const query: Record<string, unknown> = { orderNumber };
  if (email) {
    query.$or = [{ guestEmail: email.toLowerCase() }, { 'shippingAddress.email': email.toLowerCase() }];
  }

  const order = await Order.findOne(query);
  if (!order) throw new NotFoundError('Order');

  return {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    shippingCarrier: order.shippingCarrier,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    itemsSummary: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
    createdAt: order.createdAt,
  };
}

export async function getOrder(
  orderNumber: string,
  userId?: string,
  isAdmin = false
): Promise<IOrder> {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError('Order');

  // Verify access permissions: must be admin or the owner
  if (!isAdmin && order.user && order.user.toString() !== userId) {
    throw new UnauthorizedError('You are not authorized to view this order');
  }

  return order;
}

export async function cancelOrder(
  orderNumber: string,
  userId?: string,
  reason?: string
): Promise<IOrder> {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError('Order');

  if (order.user && order.user.toString() !== userId) {
    throw new UnauthorizedError('You are not authorized to cancel this order');
  }

  // Only orders in pending_payment or confirmed stage can be cancelled by customer
  if (order.orderStatus !== 'pending_payment' && order.orderStatus !== 'confirmed') {
    throw new AppError(
      `Order cannot be cancelled in its current status (${order.orderStatus}). Please contact support.`,
      400
    );
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason || 'Cancelled by customer';
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: reason || 'Cancelled by customer',
  });

  await order.save();

  // Release inventory reservations
  await releaseOrderReservations(order.items).catch((err) =>
    logger.error('Failed to release reservations on order cancellation:', err)
  );

  // Send cancellation notification
  const recipientEmail = order.guestEmail || 'customer@evee.pk';
  const recipientName = order.guestName || order.shippingAddress.fullName;
  sendCancellationEmail(recipientEmail, recipientName, order.orderNumber, reason).catch((err) =>
    logger.error('Failed to send cancellation email:', err)
  );

  return order;
}
