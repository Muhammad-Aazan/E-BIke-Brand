'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  Phone,
  ArrowRight,
  Package,
  FileText,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { formatPrice } from '@/lib/format';
import { brand } from '@/config/brand';
import { getPaymentStatus } from '@/lib/api/checkout';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderNumber = searchParams.get('order_number');
  const isTestPayment = searchParams.get('test_payment') === 'true' || searchParams.get('test_mode') === 'true';

  const { clear } = useCart();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear the cart on successful checkout
    clear();

    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    getPaymentStatus(orderNumber)
      .then((res) => {
        if (isMounted) {
          setPaymentData(res.paymentStatus);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to retrieve payment status:', err);
          setError('Could not fetch updated order details, but your reservation has been recorded.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [orderNumber, clear]);

  const order = paymentData?.order;
  const handover = order?.metadata?.vehicleHandover;

  return (
    <Section bg="bg-ink" inner="flex flex-col gap-10 px-[22px] py-14 lg:gap-14 lg:px-16 lg:py-20 max-w-[960px] mx-auto">
      {/* Top Status */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-lime/10 border border-lime/30 text-lime">
          <CheckCircle2 className="size-9" />
        </div>
        <Eyebrow>PAYMENT CONFIRMED · RESERVATION SECURED</Eyebrow>
        <h1 className="font-display text-[36px] text-fg sm:text-[48px] leading-[1.1]">
          Welcome to the Fleet.
        </h1>
        <p className="max-w-[540px] font-body text-[15px] leading-[1.7] text-muted">
          Your payment has been successfully processed through <span className="text-lime font-mono">Stripe (Test Mode)</span>. Your build slot is locked, and our white-glove concierge is preparing your handover.
        </p>
      </div>

      {/* Main Order Details Card */}
      <div className="border border-line bg-surface/70 p-6 sm:p-10 flex flex-col gap-8">
        {/* Header with order number */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6 gap-4">
          <div>
            <span className="font-mono text-[11px] text-muted uppercase">Official Order Number</span>
            <p className="font-mono text-[20px] font-medium text-fg tracking-wider">
              {orderNumber || 'EVE-RESERVATION-RECORDED'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] bg-lime/10 text-lime border border-lime/20 rounded-full">
              <span className="size-1.5 rounded-full bg-lime animate-pulse" />
              STATUS: {paymentData?.orderStatus?.toUpperCase() || 'CONFIRMED'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
              <CreditCard className="size-3" />
              STRIPE: {paymentData?.paymentStatus?.toUpperCase() || 'PAID'}
            </span>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Delivery & Handover Destination */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-[18px] text-fg flex items-center gap-2">
              <MapPin className="size-4 text-lime" />
              Vehicle Delivery Destination
            </h3>
            <div className="flex flex-col gap-1.5 font-body text-[13px] text-muted bg-ink/60 border border-line p-4">
              <p className="font-medium text-fg">
                {order?.shippingAddress?.fullName || 'Registered Owner'}
              </p>
              <p>{order?.shippingAddress?.addressLine1 || 'Delivery Address on file'}</p>
              {order?.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order?.shippingAddress?.city || 'City'}, {order?.shippingAddress?.state || ''} {order?.shippingAddress?.postalCode || ''}
              </p>
              <p className="font-mono text-[11px] text-dim">{order?.shippingAddress?.country || 'PK'}</p>
              <div className="mt-2 pt-2 border-t border-line flex items-center gap-2 font-mono text-[11px] text-dim">
                <Phone className="size-3 text-muted" />
                <span>{order?.shippingAddress?.phone || 'Contact phone registered'}</span>
              </div>
            </div>
          </div>

          {/* Right: Handover Schedule & Instructions */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-[18px] text-fg flex items-center gap-2">
              <Calendar className="size-4 text-lime" />
              Handover & Dispatch Details
            </h3>
            <div className="flex flex-col gap-2.5 font-body text-[13px] text-muted bg-ink/60 border border-line p-4">
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <span className="text-dim">Handover Service:</span>
                <span className="font-mono text-lime font-medium">White-Glove Home Handover</span>
              </div>
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <span className="text-dim">Requested Date:</span>
                <span className="font-mono text-fg">{handover?.preferredDate || 'Earliest Atelier Allocation'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <span className="text-dim">Time Window:</span>
                <span className="font-mono text-fg uppercase">{handover?.preferredTimeSlot || 'Morning (9am - 12pm)'}</span>
              </div>
              {handover?.nationalIdOrCnic && (
                <div className="flex items-center justify-between border-b border-line/60 pb-2">
                  <span className="text-dim">Recipient ID:</span>
                  <span className="font-mono text-fg">{handover.nationalIdOrCnic}</span>
                </div>
              )}
              {handover?.handoverNotes && (
                <div className="pt-1">
                  <span className="text-dim block text-[11px] mb-1">Special Instructions:</span>
                  <p className="text-[12px] italic text-fg/80">{handover.handoverNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicles / Items Reserved */}
        {order?.items && order.items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line pt-6">
            <h3 className="font-display text-[18px] text-fg flex items-center gap-2">
              <Package className="size-4 text-lime" />
              Reserved Vehicles & Configuration
            </h3>
            <div className="divide-y divide-line bg-ink/50 border border-line">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 text-[13px]">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.productName} className="size-12 object-cover bg-surface" />
                    )}
                    <div>
                      <p className="font-display text-[15px] text-fg">{item.productName}</p>
                      <p className="font-mono text-[11px] text-dim">
                        SKU: {item.sku} {item.variantName ? `· ${item.variantName}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-fg">{formatPrice(item.totalPrice / 100, order.currency || 'USD')}</p>
                    <p className="font-mono text-[10px] text-dim">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-line pt-6 gap-4">
          <div className="flex items-center gap-2 text-dim font-mono text-[11px]">
            <ShieldCheck className="size-4 text-lime" />
            <span>Includes 5-Year Powertrain Warranty & Crown Telematics</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] text-muted">Grand Total:</span>
            <span className="font-mono text-[22px] font-bold text-lime">
              {paymentData?.grandTotal ? formatPrice(paymentData.grandTotal / 100, paymentData.currency || 'USD') : 'Recorded'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex h-[50px] items-center justify-center gap-2 border border-transparent bg-lime px-8 font-body text-[13px] font-medium text-night transition-colors hover:bg-[#e0f48f]"
        >
          <span>Return to Showroom</span>
          <ArrowRight className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto inline-flex h-[50px] items-center justify-center gap-2 border border-line bg-surface px-8 font-body text-[13px] font-medium text-fg transition-colors hover:border-fg"
        >
          <FileText className="size-4" />
          <span>Print Reservation Receipt</span>
        </button>
      </div>
    </Section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center font-mono text-lime">
          Loading reservation confirmation...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
