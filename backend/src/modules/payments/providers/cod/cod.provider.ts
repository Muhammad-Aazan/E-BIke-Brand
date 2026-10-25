import {
  IPaymentProvider,
  CreateCheckoutOptions,
  CheckoutSessionResult,
  WebhookEventPayload,
  VerifiedWebhookEvent,
  RefundOptions,
  RefundResult,
} from '../payment-provider.interface';
import { config } from '../../../../config';

export class CodPaymentProvider implements IPaymentProvider {
  readonly providerName = 'cod';

  async createCheckout(options: CreateCheckoutOptions): Promise<CheckoutSessionResult> {
    const sessionId = `cod_${options.orderNumber}_${Date.now()}`;
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

    const checkoutUrl = `${frontendUrl}/checkout/success?session_id=${sessionId}&order=${options.orderNumber}&provider=cod`;

    return {
      sessionId,
      checkoutUrl,
      provider: this.providerName,
    };
  }

  async verifyWebhook(_eventPayload: WebhookEventPayload): Promise<VerifiedWebhookEvent> {
    throw new Error('Webhooks are not applicable for Cash on Delivery');
  }

  async retrievePayment(_paymentReference: string): Promise<{
    status: 'paid' | 'pending' | 'failed';
    amount: number;
    currency: string;
  }> {
    return {
      status: 'pending',
      amount: 0,
      currency: config.store.currency,
    };
  }

  async refundPayment(options: RefundOptions): Promise<RefundResult> {
    return {
      refundId: `cod_refund_${Date.now()}`,
      amount: options.amount || 0,
      status: 'succeeded',
      currency: config.store.currency,
    };
  }
}
