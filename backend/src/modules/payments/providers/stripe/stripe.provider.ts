import Stripe from 'stripe';
import { config } from '../../../../config';
import {
  IPaymentProvider,
  CreateCheckoutOptions,
  CheckoutSessionResult,
  WebhookEventPayload,
  VerifiedWebhookEvent,
  RefundOptions,
  RefundResult,
} from '../payment-provider.interface';
import { PaymentError } from '../../../../common/errors/AppError';
import { logger } from '../../../../common/utils/logger';
import { retryWithBackoff } from '../../../../common/utils/retryWithBackoff';

export class StripePaymentProvider implements IPaymentProvider {
  readonly providerName = 'stripe';
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey || 'dummy_key_for_initialization', {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }

  async createCheckout(options: CreateCheckoutOptions): Promise<CheckoutSessionResult> {
    const isPlaceholder =
      !config.stripe.secretKey ||
      config.stripe.secretKey.startsWith('sk_test_placeholder') ||
      config.stripe.secretKey === 'sk_test_...' ||
      config.stripe.secretKey === 'dummy_key_for_initialization';

    if (isPlaceholder) {
      logger.info(
        `[STRIPE TEST MODE] Generating interactive Stripe payment page for order ${options.orderNumber}`
      );
      const testSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const checkoutUrl = `${config.server.frontendUrl}/checkout/pay?session_id=${testSessionId}&order_number=${options.orderNumber}&amount=${options.grandTotal}&currency=${options.currency}`;

      return {
        sessionId: testSessionId,
        checkoutUrl,
        provider: this.providerName,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = options.items.map((item) => ({
      price_data: {
        currency: options.currency.toLowerCase(),
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images && item.images.length > 0 ? [item.images[0]] : undefined,
        },
        unit_amount: item.unitAmount,
      },
      quantity: item.quantity,
    }));

    // Add shipping as a separate line item if present
    if (options.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: options.currency.toLowerCase(),
          product_data: {
            name: 'Shipping Fee',
            description: 'Delivery charge',
          },
          unit_amount: options.shippingFee,
        },
        quantity: 1,
      });
    }

    // Add tax as a separate line item if present
    if (options.taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: options.currency.toLowerCase(),
          product_data: {
            name: 'Tax / GST',
          },
          unit_amount: options.taxAmount,
        },
        quantity: 1,
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      customer_email: options.customer.email,
      client_reference_id: options.orderNumber,
      metadata: {
        orderId: options.orderId,
        orderNumber: options.orderNumber,
        ...options.metadata,
      },
      success_url: config.stripe.successUrl.replace('{CHECKOUT_SESSION_ID}', '{CHECKOUT_SESSION_ID}'),
      cancel_url: config.stripe.cancelUrl,
    };

    const session = await retryWithBackoff(
      () =>
        this.stripe.checkout.sessions.create(
          sessionParams,
          options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined
        ),
      { maxAttempts: 3 }
    );

    if (!session.url) {
      throw new PaymentError('Failed to generate Stripe checkout URL');
    }

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      provider: this.providerName,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
    };
  }

  async verifyWebhook(eventPayload: WebhookEventPayload): Promise<VerifiedWebhookEvent> {
    if (!config.stripe.webhookSecret) {
      throw new PaymentError('Stripe webhook secret not configured');
    }

    if (!eventPayload.signature) {
      throw new PaymentError('Missing Stripe webhook signature');
    }

    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = this.stripe.webhooks.constructEvent(
        eventPayload.rawBody,
        eventPayload.signature,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      logger.error('Stripe webhook signature verification failed:', err.message);
      throw new PaymentError(`Invalid webhook signature: ${err.message}`);
    }

    let status: 'paid' | 'failed' | 'refunded' | 'unknown' = 'unknown';
    let orderNumber: string | undefined;
    let paymentIntentId: string | undefined;
    let chargeId: string | undefined;
    let amount: number | undefined;
    let currency: string | undefined;

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        status = session.payment_status === 'paid' ? 'paid' : 'unknown';
        orderNumber = session.client_reference_id || (session.metadata?.orderNumber as string);
        paymentIntentId = session.payment_intent as string;
        amount = session.amount_total || undefined;
        currency = session.currency?.toUpperCase();
        break;
      }
      case 'payment_intent.succeeded': {
        const intent = stripeEvent.data.object as Stripe.PaymentIntent;
        status = 'paid';
        orderNumber = intent.metadata?.orderNumber;
        paymentIntentId = intent.id;
        amount = intent.amount_received;
        currency = intent.currency.toUpperCase();
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = stripeEvent.data.object as Stripe.PaymentIntent;
        status = 'failed';
        orderNumber = intent.metadata?.orderNumber;
        paymentIntentId = intent.id;
        break;
      }
      case 'charge.refunded': {
        const charge = stripeEvent.data.object as Stripe.Charge;
        status = 'refunded';
        chargeId = charge.id;
        paymentIntentId = charge.payment_intent as string;
        amount = charge.amount_refunded;
        currency = charge.currency.toUpperCase();
        break;
      }
      default:
        status = 'unknown';
    }

    return {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      provider: this.providerName,
      orderNumber,
      paymentIntentId,
      chargeId,
      amount,
      currency,
      status,
      payload: stripeEvent as unknown as Record<string, unknown>,
    };
  }

  async retrievePayment(paymentReference: string): Promise<{
    status: 'paid' | 'pending' | 'failed';
    amount: number;
    currency: string;
  }> {
    const paymentIntent = await retryWithBackoff(() =>
      this.stripe.paymentIntents.retrieve(paymentReference)
    );

    let status: 'paid' | 'pending' | 'failed' = 'pending';
    if (paymentIntent.status === 'succeeded') status = 'paid';
    else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method') {
      status = 'failed';
    }

    return {
      status,
      amount: paymentIntent.amount_received || paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
    };
  }

  async refundPayment(options: RefundOptions): Promise<RefundResult> {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: options.paymentReference,
      amount: options.amount,
      reason: options.reason as Stripe.RefundCreateParams.Reason | undefined,
    };

    const refund = await retryWithBackoff(
      () =>
        this.stripe.refunds.create(
          refundParams,
          options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined
        ),
      { maxAttempts: 3 }
    );

    return {
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status === 'succeeded' ? 'succeeded' : refund.status === 'pending' ? 'pending' : 'failed',
      currency: refund.currency.toUpperCase(),
    };
  }

  async cancelPayment(paymentReference: string): Promise<boolean> {
    try {
      const intent = await this.stripe.paymentIntents.cancel(paymentReference);
      return intent.status === 'canceled';
    } catch {
      return false;
    }
  }
}
