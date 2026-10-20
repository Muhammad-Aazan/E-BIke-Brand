import { config } from '../../../config';
import { IPaymentProvider } from './payment-provider.interface';
import { StripePaymentProvider } from './stripe/stripe.provider';
import { CodPaymentProvider } from './cod/cod.provider';

let stripeProviderInstance: StripePaymentProvider | null = null;
let codProviderInstance: CodPaymentProvider | null = null;

export function getPaymentProvider(providerName?: string): IPaymentProvider {
  const selected = providerName || config.payment.provider;

  switch (selected.toLowerCase()) {
    case 'cod':
      if (!codProviderInstance) {
        codProviderInstance = new CodPaymentProvider();
      }
      return codProviderInstance;
    case 'stripe':
    default:
      if (!stripeProviderInstance) {
        stripeProviderInstance = new StripePaymentProvider();
      }
      return stripeProviderInstance;
  }
}

export * from './payment-provider.interface';
export { StripePaymentProvider } from './stripe/stripe.provider';
export { CodPaymentProvider } from './cod/cod.provider';
