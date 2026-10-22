import mongoose from 'mongoose';
import {
  Payment,
  Order,
  WebhookEvent,
  AuditLog,
  IOrder,
  IPayment,
} from '../../database/models';
import { NotFoundError, PaymentError, AppError } from '../../common/errors/AppError';
import { getPaymentProvider, VerifiedWebhookEvent } from './providers';
import { commitOrderInventory, releaseOrderReservations } from '../inventory/inventory.service';
import { sendOrderConfirmationEmail, sendRefundEmail } from '../notifications/email.service';
import { fromSubunit } from '../../common/utils/decimal';
import { logger } from '../../common/utils/logger';

/**
 * Handle incoming Stripe webhook with signature verification and idempotency check.
 */
export async function processStripeWebhook(
  rawBody: Buffer | string,
  signature: string
): Promise<{ received: boolean; eventId?: string }> {
  const provider = getPaymentProvider('stripe');

  // 1. Verify signature and parse event
  const verifiedEvent: VerifiedWebhookEvent = await provider.verifyWebhook({
    rawBody,
    signature,
  });

  // 2. Idempotency check: has this event already been processed?
  const existingEvent = await WebhookEvent.findOne({
    provider: 'stripe',
    eventId: verifiedEvent.eventId,
  });

  if (existingEvent && existingEvent.status === 'processed') {
    logger.info(`Webhook event ${verifiedEvent.eventId} already processed, skipping duplicate`);
    return { received: true, eventId: verifiedEvent.eventId };
  }

  // Record event in WebhookEvent collection
  const webhookRecord =
    existingEvent ||
    (await WebhookEvent.create({
      provider: 'stripe',
      eventId: verifiedEvent.eventId,
      eventType: verifiedEvent.eventType,
      payload: verifiedEvent.payload,
      status: 'received',
    }));

  try {
    // 3. Process according to event status
    if (verifiedEvent.status === 'paid' && verifiedEvent.orderNumber) {
      await handlePaymentSuccess(verifiedEvent);
    } else if (verifiedEvent.status === 'failed' && verifiedEvent.orderNumber) {
      await handlePaymentFailure(verifiedEvent);
    } else if (verifiedEvent.status === 'refunded' && verifiedEvent.orderNumber) {
      await handlePaymentRefunded(verifiedEvent);
    }

    // 4. Mark event as processed
    webhookRecord.status = 'processed';
    webhookRecord.processedAt = new Date();
    await webhookRecord.save();

    return { received: true, eventId: verifiedEvent.eventId };
  } catch (error: any) {
    webhookRecord.status = 'failed';
    webhookRecord.processingError = error.message;
    await webhookRecord.save();
    logger.error(`Error processing webhook event ${verifiedEvent.eventId}:`, error);
    throw error;
  }
}

/**
 * Handle verified payment success:
 * - Update Order and Payment records
 * - Commit inventory deduction exactly once
 * - Send order confirmation email
 */
async function handlePaymentSuccess(event: VerifiedWebhookEvent): Promise<void> {
  const order = await Order.findOne({ orderNumber: event.orderNumber });
  if (!order) {
    logger.warn(`Webhook received for unknown order: ${event.orderNumber}`);
    return;
  }

  // If already paid, do not duplicate inventory commit
  if (order.paymentStatus === 'paid') {
    logger.info(`Order ${order.orderNumber} already marked paid, skipping redundant commit`);
    return;
  }

  // Verify amount matches (within small tolerance or exact subunit match)
  if (event.amount && event.amount !== order.grandTotal) {
    logger.error(
      `Payment amount mismatch for order ${order.orderNumber}: expected ${order.grandTotal}, received ${event.amount}`
    );
    throw new PaymentError('Payment amount mismatch');
  }

  // 1. Update Order
  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.stripePaymentIntentId = event.paymentIntentId || order.stripePaymentIntentId;
  order.statusHistory.push({
    status: 'confirmed',
    timestamp: new Date(),
    note: `Payment verified via ${event.provider} (${event.eventType})`,
  });
  await order.save();

  // 2. Update Payment record
  await Payment.updateOne(
    { orderNumber: order.orderNumber },
    {
      $set: {
        status: 'paid',
        paidAt: new Date(),
        providerPaymentIntentId: event.paymentIntentId,
        providerChargeId: event.chargeId,
      },
      $addToSet: { processedEventIds: event.eventId },
    }
  );

  // 3. Commit inventory (release reservation and decrement available stock)
  await commitOrderInventory(order.items, order.orderNumber);

  // 4. Send Confirmation Email
  const recipientEmail = order.guestEmail || 'customer@evee.pk';
  const recipientName = order.guestName || order.shippingAddress.fullName;
  const itemsList = order.items.map((i) => ({
    name: i.productName + (i.variantName ? ` (${i.variantName})` : ''),
    quantity: i.quantity,
    price: `${order.currency} ${fromSubunit(i.totalPrice)}`,
  }));

  sendOrderConfirmationEmail(
    recipientEmail,
    recipientName,
    order.orderNumber,
    itemsList,
    `${order.currency} ${fromSubunit(order.grandTotal)}`
  ).catch((err) => logger.error('Order confirmation email failed:', err));
}

async function handlePaymentFailure(event: VerifiedWebhookEvent): Promise<void> {
  const order = await Order.findOne({ orderNumber: event.orderNumber });
  if (!order) return;

  order.paymentStatus = 'failed';
  order.statusHistory.push({
    status: order.orderStatus,
    timestamp: new Date(),
    note: `Payment failed via ${event.provider}`,
  });
  await order.save();

  await Payment.updateOne(
    { orderNumber: order.orderNumber },
    {
      $set: { status: 'failed', failedAt: new Date() },
      $addToSet: { processedEventIds: event.eventId },
    }
  );

  // Release reservation on failure
  await releaseOrderReservations(order.items);
}

async function handlePaymentRefunded(event: VerifiedWebhookEvent): Promise<void> {
  const order = await Order.findOne({ orderNumber: event.orderNumber });
  if (!order) return;

  const refundAmount = event.amount || order.grandTotal;
  order.refundedAmount = (order.refundedAmount || 0) + refundAmount;
  order.paymentStatus = order.refundedAmount >= order.grandTotal ? 'refunded' : 'partially_refunded';
  order.orderStatus = order.refundedAmount >= order.grandTotal ? 'refunded' : 'partially_refunded';

  order.statusHistory.push({
    status: order.orderStatus,
    timestamp: new Date(),
    note: `Refund confirmed via ${event.provider} event ${event.eventId}`,
  });
  await order.save();
}

/**
 * Retrieve current authoritative payment status for the success / confirmation page.
 */
export async function getPaymentStatus(orderNumber: string): Promise<{
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  grandTotal: number;
  currency: string;
  paidAt?: Date;
  order?: any;
}> {
  let order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError('Order');

  // Handle test mode payment simulation auto-confirmation
  if (order.paymentStatus === 'pending' && order.paymentReference?.startsWith('cs_test_')) {
    logger.info(`[STRIPE TEST MODE] Auto-confirming test payment for order ${orderNumber}`);
    try {
      await handlePaymentSuccess({
        eventId: `evt_sim_${Date.now()}`,
        eventType: 'checkout.session.completed',
        provider: 'stripe',
        orderNumber: order.orderNumber,
        paymentIntentId: `pi_sim_${Date.now()}`,
        amount: order.grandTotal,
        currency: order.currency,
        status: 'paid',
        payload: { simulated: true },
      });
      order = await Order.findOne({ orderNumber });
    } catch (err: any) {
      logger.error('Error auto-confirming simulated payment:', err);
    }
  }

  const payment = await Payment.findOne({ orderNumber });

  return {
    orderNumber: order!.orderNumber,
    paymentStatus: order!.paymentStatus,
    orderStatus: order!.orderStatus,
    grandTotal: order!.grandTotal,
    currency: order!.currency,
    paidAt: payment?.paidAt,
    order: order!,
  };
}

/**
 * Admin authorized refund workflow:
 * - Validates refundable amount and payment state
 * - Calls provider refund method
 * - Updates order and payment records with verified provider result
 * - Writes audit log
 */
export async function processRefund(params: {
  orderNumber: string;
  amount?: number; // subunits; undefined = full refund
  reason?: string;
  adminUserId: string;
  ipAddress?: string;
}): Promise<{ order: IOrder; payment: IPayment }> {
  const order = await Order.findOne({ orderNumber: params.orderNumber });
  if (!order) throw new NotFoundError('Order');

  const payment = await Payment.findOne({ orderNumber: params.orderNumber });
  if (!payment) throw new NotFoundError('Payment record');

  if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'partially_refunded') {
    throw new AppError('Cannot refund an unpaid order', 400);
  }

  const remainingRefundable = order.grandTotal - (order.refundedAmount || 0);
  const requestedRefund = params.amount ?? remainingRefundable;

  if (requestedRefund <= 0 || requestedRefund > remainingRefundable) {
    throw new AppError(
      `Invalid refund amount. Maximum refundable is ${fromSubunit(remainingRefundable)}`,
      400
    );
  }

  // 1. Call payment provider refund
  const provider = getPaymentProvider(payment.provider);
  const paymentReference = payment.providerPaymentIntentId || payment.providerChargeId || '';

  const refundResult = await provider.refundPayment({
    paymentReference,
    amount: requestedRefund,
    reason: params.reason,
    idempotencyKey: `refund_${order.orderNumber}_${Date.now()}`,
  });

  // 2. Update Payment record with refund details
  payment.refunds.push({
    refundId: refundResult.refundId,
    amount: refundResult.amount,
    reason: params.reason,
    status: refundResult.status,
    requestedAt: new Date(),
    processedAt: new Date(),
    requestedBy: new mongoose.Types.ObjectId(params.adminUserId),
  });
  payment.refundedTotal = (payment.refundedTotal || 0) + refundResult.amount;
  payment.status = payment.refundedTotal >= payment.amount ? 'refunded' : 'partially_refunded';
  await payment.save();

  // 3. Update Order
  order.refundedAmount = (order.refundedAmount || 0) + refundResult.amount;
  order.paymentStatus = order.refundedAmount >= order.grandTotal ? 'refunded' : 'partially_refunded';
  order.orderStatus = order.refundedAmount >= order.grandTotal ? 'refunded' : 'partially_refunded';
  order.statusHistory.push({
    status: order.orderStatus,
    timestamp: new Date(),
    note: `Refund of ${order.currency} ${fromSubunit(refundResult.amount)} processed (${params.reason || 'Admin initiated'})`,
    updatedBy: new mongoose.Types.ObjectId(params.adminUserId),
  });
  await order.save();

  // 4. Write Audit Log
  await AuditLog.create({
    action: 'ORDER_REFUND',
    entity: 'Order',
    entityId: order._id.toString(),
    performedBy: new mongoose.Types.ObjectId(params.adminUserId),
    performedByRole: 'admin',
    ipAddress: params.ipAddress,
    metadata: {
      orderNumber: order.orderNumber,
      refundAmount: refundResult.amount,
      refundId: refundResult.refundId,
      reason: params.reason,
    },
  });

  // 5. Send Refund Notification Email
  const recipientEmail = order.guestEmail || 'customer@evee.pk';
  const recipientName = order.guestName || order.shippingAddress.fullName;
  sendRefundEmail(
    recipientEmail,
    recipientName,
    order.orderNumber,
    `${order.currency} ${fromSubunit(refundResult.amount)}`
  ).catch((err) => logger.error('Refund email failed:', err));

  return { order, payment };
}
