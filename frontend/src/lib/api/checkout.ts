import { api } from './client';
import { endpoints } from './endpoints';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  testOtp?: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  verificationToken: string;
  email: string;
  message: string;
}

export interface CheckoutPayload {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  nationalIdOrCnic?: string;
  emailVerificationToken?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  deliveryHandover?: {
    preferredDate?: string;
    preferredTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'anytime';
    handoverType?: 'home_delivery' | 'atelier_pickup';
    landmarkOrCrossStreet?: string;
    handoverNotes?: string;
  };
  paymentProvider: 'stripe' | 'cod' | 'bank_transfer';
  customerNotes?: string;
}

export interface CreateOrderResponse {
  order: any;
  checkoutUrl: string;
  sessionId: string;
}

export interface PaymentStatusResponse {
  paymentStatus: {
    orderNumber: string;
    paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
    orderStatus: string;
    grandTotal: number;
    currency: string;
    paidAt?: string;
    order?: any;
  };
}

export async function sendCheckoutOtp(email: string, fullName?: string): Promise<SendOtpResponse> {
  return api<SendOtpResponse>(endpoints.checkout.sendOtp, {
    method: 'POST',
    body: { email, fullName },
  });
}

export async function verifyCheckoutOtp(email: string, code: string): Promise<VerifyOtpResponse> {
  return api<VerifyOtpResponse>(endpoints.checkout.verifyOtp, {
    method: 'POST',
    body: { email, code },
  });
}

export async function createCheckoutOrder(payload: CheckoutPayload): Promise<CreateOrderResponse> {
  return api<CreateOrderResponse>(endpoints.checkout.createOrder, {
    method: 'POST',
    body: payload,
  });
}

export async function getPaymentStatus(orderNumber: string): Promise<PaymentStatusResponse> {
  return api<PaymentStatusResponse>(endpoints.payments.status(orderNumber));
}
