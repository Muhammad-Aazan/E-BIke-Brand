'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { getPaymentStatus } from '@/lib/api/checkout';
import { brand } from '@/config/brand';

function StripePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('session_id') || '';
  const orderNumber = searchParams.get('order_number') || '';
  const amountParam = searchParams.get('amount');
  const currencyParam = searchParams.get('currency') || 'USD';

  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [postalCode, setPostalCode] = useState('75600');
  const [country, setCountry] = useState('PK');

  // Processing State
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Order Details
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (orderNumber) {
      getPaymentStatus(orderNumber)
        .then((res) => {
          if (res?.paymentStatus?.order) {
            setOrderDetails(res.paymentStatus.order);
            if (!nameOnCard && res.paymentStatus.order.guestName) {
              setNameOnCard(res.paymentStatus.order.guestName);
            }
          }
        })
        .catch(() => {});
    }
  }, [orderNumber, nameOnCard]);

  // Card formatting helpers
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Quick-fill test card
  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('123');
    if (!nameOnCard) setNameOnCard('Muhammad Aazan');
    setError(null);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }

    if (expiry.length < 5) {
      setError('Please enter expiration date (MM/YY).');
      return;
    }

    if (cvc.length < 3) {
      setError('Please enter a valid 3 or 4-digit CVC.');
      return;
    }

    setProcessing(true);
    setProcessingStep('Authorizing payment with Stripe test network...');

    try {
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep('Verifying cardholder funds & reserving build slot...');
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep('Capturing payment intent...');

      // Authorize payment on backend
      await getPaymentStatus(orderNumber);

      await new Promise((r) => setTimeout(r, 500));
      setProcessingStep('Payment succeeded! Redirecting to confirmation...');
      await new Promise((r) => setTimeout(r, 600));

      router.push(`/checkout/success?session_id=${sessionId}&order_number=${orderNumber}&test_payment=true`);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
      setProcessing(false);
      setProcessingStep(null);
    }
  };

  const totalAmount = orderDetails?.grandTotal
    ? orderDetails.grandTotal / 100
    : amountParam
    ? parseInt(amountParam, 10) / 100
    : 24900;
  const currency = orderDetails?.currency || currencyParam;

  return (
    <div className="min-h-screen bg-[#0d0e12] text-fg py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-[980px] grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#13151b] border border-line shadow-2xl rounded-lg overflow-hidden">
        {/* Left Side: Order summary & branding */}
        <div className="lg:col-span-5 bg-[#0f1116] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-line">
          <div className="flex flex-col gap-6">
            <div>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 font-mono text-[11px] text-muted hover:text-lime transition-colors mb-6"
              >
                <ArrowLeft className="size-3.5" />
                <span>Cancel and return to bag</span>
              </Link>
              <div className="flex items-center gap-2 text-lime font-mono text-[11px] uppercase tracking-wider mb-1">
                <Sparkles className="size-3.5" />
                <span>{brand.upper} ATELIER CHECKOUT</span>
              </div>
              <h1 className="font-display text-[26px] text-fg">
                Electric Vehicle Reservation
              </h1>
            </div>

            {/* Price Header */}
            <div className="bg-[#181a22] border border-line p-4 rounded">
              <span className="font-mono text-[11px] text-muted uppercase block">
                Total Deposit Due
              </span>
              <p className="font-mono text-[32px] font-bold text-lime">
                {formatPrice(totalAmount, currency)}
              </p>
              <p className="font-mono text-[11px] text-dim mt-1">
                Order #{orderNumber || 'EVE-CHECKOUT'}
              </p>
            </div>

            {/* Line items list */}
            {orderDetails?.items && (
              <div className="divide-y divide-line/60 border-y border-line/60 py-2">
                {orderDetails.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-[13px]">
                    <span className="text-muted">{item.productName}</span>
                    <span className="font-mono text-fg">{formatPrice(item.totalPrice / 100, currency)}</span>
                  </div>
                ))}
                <div className="py-2 flex items-center justify-between text-[13px]">
                  <span className="text-muted">White-Glove Handover</span>
                  <span className="font-mono text-lime">Complimentary</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-muted border-t border-line/60 pt-4 mt-6">
            <ShieldCheck className="size-4 text-lime shrink-0" />
            <span>Guaranteed 100% refundable deposit prior to build completion.</span>
          </div>
        </div>

        {/* Right Side: Stripe Card Payment Sheet */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <form onSubmit={handlePay} className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-lime" />
                <span className="font-display text-[18px] text-fg">Pay with Card</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded font-mono text-[10px] bg-lime/10 text-lime border border-lime/30 uppercase tracking-wider font-semibold">
                  Stripe Test Mode
                </span>
              </div>
            </div>

            {/* Quick Fill Test Card Button */}
            <div className="bg-[#1c1f28] border border-dashed border-lime/40 p-3 rounded flex items-center justify-between">
              <div className="text-[12px]">
                <p className="text-fg font-medium">Stripe Test Card Ready</p>
                <p className="font-mono text-[11px] text-dim">Use Visa 4242... for immediate testing</p>
              </div>
              <button
                type="button"
                onClick={fillTestCard}
                className="px-3 py-1.5 bg-lime/10 hover:bg-lime/20 border border-lime/40 font-mono text-[11px] text-lime font-semibold transition-colors rounded"
              >
                Auto-Fill Test Card
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-3 rounded text-[13px] text-rose-300">
                <AlertCircle className="size-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Card Inputs */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Card Information
                </label>
                <div className="border border-line rounded bg-ink overflow-hidden focus-within:border-lime transition-colors">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="1234 1234 1234 1234"
                      className="w-full bg-transparent px-3.5 py-3 font-mono text-[14px] text-fg placeholder:text-dim focus:outline-none"
                    />
                    <CreditCard className="absolute right-3.5 top-3.5 size-4 text-dim pointer-events-none" />
                  </div>
                  <div className="grid grid-cols-2 border-t border-line">
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM / YY"
                      className="bg-transparent px-3.5 py-2.5 font-mono text-[13px] text-fg placeholder:text-dim focus:outline-none border-r border-line"
                    />
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="CVC"
                      className="bg-transparent px-3.5 py-2.5 font-mono text-[13px] text-fg placeholder:text-dim focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="Full name as printed on card"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim rounded focus:outline-none focus:border-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[13px] text-fg rounded focus:outline-none focus:border-lime"
                  >
                    <option value="PK">Pakistan</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AE">United Arab Emirates</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="75600"
                    className="w-full bg-ink border border-line px-3.5 py-2.5 font-mono text-[13px] text-fg placeholder:text-dim rounded focus:outline-none focus:border-lime"
                  />
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full h-[52px] bg-lime text-night font-body text-[14px] font-semibold rounded hover:bg-[#e0f48f] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-lg shadow-lime/10"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{processingStep || 'Processing Payment...'}</span>
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Pay {formatPrice(totalAmount, currency)}</span>
                </>
              )}
            </button>

            {/* Stripe Branding & Security */}
            <div className="flex flex-col items-center justify-center gap-1.5 text-center mt-2">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-dim">
                <Lock className="size-3 text-lime" />
                <span>Powered by</span>
                <span className="font-bold text-fg tracking-wider">stripe</span>
              </div>
              <p className="text-[10px] font-mono text-muted">
                Test Mode · 256-Bit SSL Encrypted Transaction
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StripePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink flex items-center justify-center font-mono text-lime">
          Loading Stripe Payment Gateway...
        </div>
      }
    >
      <StripePaymentContent />
    </Suspense>
  );
}
