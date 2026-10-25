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

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async createCheckout(options: CreateCheckoutOptions): Promise<CheckoutSessionResult> {
    if (
      !config.stripe.secretKey ||
      config.stripe.secretKey === 'dummy_key_for_initialization' ||
      config.stripe.secretKey === 'sk_test_...'
    ) {
      throw new PaymentError(
        'Real Stripe Secret Key is not configured. Please set STRIPE_SECRET_KEY in your backend .env file.'
      );
    }

    const currency = (config.stripe.currency || options.currency).toLowerCase();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = options.items.map((item) => {
      // Stripe requires absolute public URLs (http/https) without localhost for images
      const validImages = item.images?.filter(
        (img) =>
          typeof img === 'string' &&
          img.startsWith('http') &&
          !img.includes('localhost') &&
          !img.includes('127.0.0.1')
      );

      return {
        price_data: {
          currency,
          product_data: {
            name: item.name || 'Electric Vehicle / Equipment',
            description: item.description?.substring(0, 500) || undefined,
            images: validImages && validImages.length > 0 ? [validImages[0]] : undefined,
          },
          unit_amount: item.unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Add shipping as a separate line item if present
    if (options.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: 'White-Glove Vehicle Delivery & Handover Dispatch',
            description: 'Insured carrier delivery directly to your specified address',
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
          currency,
          product_data: {
            name: 'Tax / GST',
          },
          unit_amount: options.taxAmount,
        },
        quantity: 1,
      });
    }

    // Dynamically resolve frontend URL to current Vercel production domain or client origin
    let frontendUrl = options.clientOrigin;
    if (
      (!frontendUrl || frontendUrl.includes('localhost')) &&
      process.env.VERCEL_URL
    ) {
      frontendUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!frontendUrl && process.env.NODE_ENV === 'production') {
      frontendUrl = 'https://e-b-ike-brand-ql7x.vercel.app';
    }
    if (!frontendUrl) {
      frontendUrl = config.server.frontendUrl;
    }
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    frontendUrl = frontendUrl.replace(/\/$/, '');

    const successUrl = `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_number=${options.orderNumber}`;
    const cancelUrl = `${frontendUrl}/checkout/cancel?order_number=${options.orderNumber}`;

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
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    logger.info(`[STRIPE] Creating Checkout Session for order ${options.orderNumber} in currency ${currency}`);

    const session = await retryWithBackoff(
      () =>
        this.stripe.checkout.sessions.create(
          sessionParams,
          options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined
        ),
      { maxAttempts: 3 }
    );

    if (!session.url) {
      throw new PaymentError('Failed to generate official Stripe checkout URL');
    }

    logger.info(`[STRIPE] Checkout Session created: ${session.id}`);

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
        paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
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
