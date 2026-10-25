export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface CheckoutLineItem {
  name: string;
  description?: string;
  images?: string[];
  unitAmount: number; // in subunits (paisa/cents)
  quantity: number;
}

export interface CreateCheckoutOptions {
  orderId: string;
  orderNumber: string;
  customer: CheckoutCustomerInfo;
  items: CheckoutLineItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  clientOrigin?: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: string;
  expiresAt?: Date;
}

export interface WebhookEventPayload {
  rawBody: Buffer | string;
  signature?: string;
  headers?: Record<string, string | string[] | undefined>;
}

export interface VerifiedWebhookEvent {
  eventId: string;
  eventType: string;
  provider: string;
  orderNumber?: string;
  paymentIntentId?: string;
  chargeId?: string;
  amount?: number; // subunits
  currency?: string;
  status: 'paid' | 'failed' | 'refunded' | 'unknown';
  payload: Record<string, unknown>;
}

export interface RefundOptions {
  paymentReference: string; // charge ID or payment intent ID
  amount?: number;          // subunits, optional for full refund
  reason?: string;
  idempotencyKey?: string;
}

export interface RefundResult {
  refundId: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  currency: string;
}

export interface IPaymentProvider {
  readonly providerName: string;

  createCheckout(options: CreateCheckoutOptions): Promise<CheckoutSessionResult>;

  verifyWebhook(event: WebhookEventPayload): Promise<VerifiedWebhookEvent>;

  retrievePayment(paymentReference: string): Promise<{
    status: 'paid' | 'pending' | 'failed';
    amount: number;
    currency: string;
  }>;

  refundPayment(options: RefundOptions): Promise<RefundResult>;

  cancelPayment?(paymentReference: string): Promise<boolean>;
}
