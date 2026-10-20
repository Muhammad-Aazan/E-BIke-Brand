import { describe, it, expect, vi } from 'vitest';
import { getPaymentProvider, CodPaymentProvider, StripePaymentProvider } from '../src/modules/payments/providers';

describe('Payment Provider Architecture', () => {
  it('instantiates the COD payment provider properly', () => {
    const provider = getPaymentProvider('cod');
    expect(provider).toBeInstanceOf(CodPaymentProvider);
    expect(provider.providerName).toBe('cod');
  });

  it('instantiates the Stripe payment provider by default', () => {
    const provider = getPaymentProvider('stripe');
    expect(provider).toBeInstanceOf(StripePaymentProvider);
    expect(provider.providerName).toBe('stripe');
  });

  it('COD provider creates checkout URL with order number and session ID', async () => {
    const codProvider = new CodPaymentProvider();
    const result = await codProvider.createCheckout({
      orderId: 'test_order_id_123',
      orderNumber: 'EVE-TEST-1234',
      customer: { name: 'Customer Test', email: 'test@evee.pk' },
      items: [{ name: 'EVee City Commuter', unitAmount: 19500000, quantity: 1 }],
      subtotal: 19500000,
      discountAmount: 0,
      shippingFee: 0,
      taxAmount: 0,
      grandTotal: 19500000,
      currency: 'PKR',
    });

    expect(result.provider).toBe('cod');
    expect(result.sessionId).toContain('cod_EVE-TEST-1234');
    expect(result.checkoutUrl).toContain('order=EVE-TEST-1234');
  });

  it('COD provider processes refunds without external API', async () => {
    const codProvider = new CodPaymentProvider();
    const result = await codProvider.refundPayment({
      paymentReference: 'cod_EVE-TEST-1234',
      amount: 19500000,
      reason: 'Customer cancellation',
    });

    expect(result.status).toBe('succeeded');
    expect(result.amount).toBe(19500000);
    expect(result.refundId).toContain('cod_refund');
  });

  it('Stripe provider throws PaymentError when webhook signature is missing', async () => {
    const { config } = await import('../src/config');
    (config.stripe as any).webhookSecret = 'whsec_test_mock_secret';

    const stripeProvider = new StripePaymentProvider();
    await expect(
      stripeProvider.verifyWebhook({
        rawBody: Buffer.from(JSON.stringify({ type: 'test' })),
        signature: undefined,
      })
    ).rejects.toThrow('Missing Stripe webhook signature');
  });
});
