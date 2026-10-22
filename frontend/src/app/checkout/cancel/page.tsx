'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function CheckoutCancelPage() {
  return (
    <Section bg="bg-ink" inner="flex flex-col items-center justify-center text-center gap-6 px-[22px] py-20 min-h-[60vh] max-w-[600px] mx-auto">
      <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
        <AlertCircle className="size-8" />
      </div>
      <Eyebrow>PAYMENT CANCELLED</Eyebrow>
      <h1 className="font-display text-[36px] text-fg sm:text-[44px]">
        Checkout Incomplete
      </h1>
      <p className="font-body text-[14px] leading-[1.7] text-muted">
        Your Stripe checkout session was cancelled or timed out. Don’t worry — your selected vehicles and customizations remain safely saved in your reservation bag.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
        <Link
          href="/cart"
          className="w-full sm:w-auto inline-flex h-[50px] items-center justify-center gap-2 border border-transparent bg-lime px-8 font-body text-[13px] font-medium text-night transition-colors hover:bg-[#e0f48f]"
        >
          <ShoppingBag className="size-4" />
          <span>Return to Reservation Bag</span>
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex h-[50px] items-center justify-center gap-2 border border-line bg-surface px-8 font-body text-[13px] font-medium text-fg transition-colors hover:border-fg"
        >
          <ArrowLeft className="size-4" />
          <span>Continue Browsing</span>
        </Link>
      </div>
    </Section>
  );
}
