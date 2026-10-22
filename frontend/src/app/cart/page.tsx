'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { formatPrice } from '@/lib/format';
import { brand } from '@/config/brand';

export default function CartPage() {
  const { lines, count, subtotal, setQty, remove, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setIsCheckingOut(true);
  };

  return (
    <Section bg="bg-ink" inner="flex flex-col gap-10 px-[22px] py-12 lg:gap-14 lg:px-16 lg:py-20">
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 font-mono text-[11px] text-muted transition-colors hover:text-lime"
        >
          <ArrowLeft className="size-3.5" />
          <span>CONTINUE BROWSING</span>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <Eyebrow>SHOPPING BAG — {brand.upper} {brand.descriptor}</Eyebrow>
        <h1 className="font-display text-[38px] leading-[1.08] text-fg lg:text-[54px]">
          {isCheckingOut ? 'Finalize Reservation & Handover' : `Your Reservation (${count})`}
        </h1>
      </div>

      {/* Sign-in prompt overlay */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-[#111] border border-line p-8 flex flex-col gap-6">
            <div>
              <p className="font-mono text-[11px] text-lime uppercase mb-2">Account Required</p>
              <h2 className="font-display text-[26px] text-fg">Sign in to Continue</h2>
              <p className="font-body text-[14px] text-muted mt-2 leading-relaxed">
                Please sign in or create an account before placing your vehicle reservation. Your cart items are saved.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/login?redirect=/cart"
                className="w-full inline-flex h-[48px] items-center justify-center gap-2 bg-lime text-night font-semibold text-[14px] hover:bg-[#e0f48f] transition-colors"
              >
                <LogIn className="size-4" />
                Sign In to My Account
              </Link>
              <Link
                href="/signup?redirect=/cart"
                className="w-full inline-flex h-[48px] items-center justify-center gap-2 border border-line text-fg font-body text-[14px] hover:border-lime transition-colors"
              >
                Create New Account
              </Link>
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="font-mono text-[11px] text-muted hover:text-fg transition-colors"
              >
                Cancel, go back to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="flex min-h-[340px] flex-col items-center justify-center border border-line bg-surface/50 p-8 text-center">
          <ShoppingBag className="mb-4 size-12 text-muted" strokeWidth={1.2} />
          <h2 className="mb-2 font-display text-[24px] text-fg">Your bag is empty</h2>
          <p className="mb-8 max-w-[420px] font-body text-[14px] leading-[1.7] text-muted">
            You haven’t added any electric motorcycles or atelier reservations to your bag yet.
          </p>
          <Button href="/products">Explore Motorcycles</Button>
        </div>
      ) : isCheckingOut ? (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Main Checkout Form */}
          <div className="lg:col-span-8">
            <CheckoutForm onCancel={() => setIsCheckingOut(false)} />
          </div>

          {/* Mini Summary Sidebar */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="border border-line bg-surface/80 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
                <h2 className="font-display text-[20px] text-fg">Reservation Bag</h2>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="font-mono text-[11px] text-lime hover:underline"
                >
                  Edit Items
                </button>
              </div>

              <div className="divide-y divide-line mb-6">
                {lines.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="size-10 object-cover bg-surface" />
                      )}
                      <div>
                        <p className="font-medium text-fg">{item.name}</p>
                        <p className="font-mono text-[11px] text-muted">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <span className="font-mono text-fg">{formatPrice(item.price * item.qty, item.currency)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-4 font-body text-[13px]">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-mono text-fg">{formatPrice(subtotal, 'USD')}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>White-Glove Handover</span>
                  <span className="font-mono text-lime">Complimentary</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Documentation & Telematics</span>
                  <span className="font-mono text-lime">Included</span>
                </div>
                <div className="flex justify-between text-fg font-medium pt-2 border-t border-line text-[15px]">
                  <span>Total Deposit</span>
                  <span className="font-mono text-lime font-bold">{formatPrice(subtotal, 'USD')}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 font-mono text-[10px] text-muted">
                <ShieldCheck className="size-4 shrink-0 text-lime" />
                <span>100% Refundable deposit prior to build completion.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Items list */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="flex items-center justify-between border-b border-line pb-4 font-mono text-[11px] uppercase text-muted">
              <span>Item Description</span>
              <button
                type="button"
                onClick={clear}
                className="text-dim hover:text-fg transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-col divide-y divide-line">
              {lines.map((item) => (
                <div key={item.id} className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    {item.image && (
                      <div className="relative size-24 shrink-0 overflow-hidden bg-surface sm:size-28">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-display text-[20px] text-fg hover:text-lime transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="font-mono text-[12px] text-muted">
                        Unit price: {formatPrice(item.price, item.currency)}
                      </p>
                      <p className="font-mono text-[10px] text-dim">
                        Included: Crown White-Glove Handover
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:gap-8">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-line bg-surface">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.id, item.qty - 1)}
                        className="p-2 text-fg hover:text-lime"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-[12px] text-fg">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.id, item.qty + 1)}
                        className="p-2 text-fg hover:text-lime"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <p className="font-mono text-[15px] font-medium text-fg">
                      {formatPrice(item.price * item.qty, item.currency)}
                    </p>

                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => remove(item.id)}
                      className="text-muted hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="border border-line bg-surface/80 p-6 sm:p-8">
              <h2 className="mb-6 font-display text-[22px] text-fg">Order Summary</h2>

              <div className="flex flex-col gap-4 border-b border-line pb-6 font-body text-[14px]">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-mono text-fg">{formatPrice(subtotal, 'USD')}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>White-Glove Delivery</span>
                  <span className="font-mono text-lime">Complimentary</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Registration & Docs</span>
                  <span className="font-mono text-lime">Included</span>
                </div>
              </div>

              <div className="my-6 flex justify-between font-display text-[22px] text-fg">
                <span>Estimated Total</span>
                <span className="font-mono text-lime">{formatPrice(subtotal, 'USD')}</span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full inline-flex h-[52px] items-center justify-center gap-2 border border-transparent bg-lime px-6 font-body text-[13px] font-medium text-night transition-colors duration-200 hover:bg-[#e0f48f]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="size-4" />
              </button>

              <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 font-mono text-[10px] text-muted">
                <ShieldCheck className="size-4 shrink-0 text-lime" />
                <span>100% Refundable deposit prior to final build sign-off.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
