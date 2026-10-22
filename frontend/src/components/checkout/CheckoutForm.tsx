'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Mail,
  Phone,
  User,
  MapPin,
  Calendar,
  Clock,
  FileCheck,
  Check,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { sendCheckoutOtp, verifyCheckoutOtp, createCheckoutOrder } from '@/lib/api/checkout';
import { formatPrice } from '@/lib/format';

interface CheckoutFormProps {
  onCancel?: () => void;
}

export function CheckoutForm({ onCancel }: CheckoutFormProps) {
  const { lines, subtotal } = useCart();

  // Customer Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalIdOrCnic, setNationalIdOrCnic] = useState('');

  // Email Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);

  // Delivery Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('PK');

  // Handover Preferences
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [handoverNotes, setHandoverNotes] = useState('');

  // Order Submission State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handlers for Email Verification OTP
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setOtpError('Please enter a valid email address first.');
      return;
    }

    setSendingOtp(true);
    setOtpError(null);
    setOtpMessage(null);
    setTestOtpNotice(null);

    try {
      const res = await sendCheckoutOtp(email, fullName);
      setOtpSent(true);
      setOtpMessage(res.message || 'Verification code sent to your email.');
      if (res.testOtp) {
        setTestOtpNotice(res.testOtp);
        // Pre-fill for instant development testing
        setOtpCode(res.testOtp);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to dispatch verification code. Please check email address.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit code received on your email.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await verifyCheckoutOtp(email, otpCode.trim());
      setIsEmailVerified(true);
      setVerificationToken(res.verificationToken);
      setOtpMessage('Email address verified successfully!');
      setOtpError(null);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired verification code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handler for Checkout Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter your full legal name.');
      return;
    }

    if (!email.trim() || !isEmailVerified) {
      setFormError('Please verify your email address before placing the order.');
      return;
    }

    if (!phone.trim()) {
      setFormError('Please provide a valid phone number for delivery driver coordination.');
      return;
    }

    if (!addressLine1.trim() || !city.trim()) {
      setFormError('Please provide complete delivery street address and city.');
      return;
    }

    if (lines.length === 0) {
      setFormError('Your reservation bag is empty.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        guestName: fullName.trim(),
        guestEmail: email.trim().toLowerCase(),
        guestPhone: phone.trim(),
        nationalIdOrCnic: nationalIdOrCnic.trim() || undefined,
        emailVerificationToken: verificationToken,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.qty,
        })),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          country: country.trim().toUpperCase() || 'PK',
        },
        deliveryHandover: {
          preferredDate: preferredDate || undefined,
          preferredTimeSlot,
          handoverType: 'home_delivery' as const,
          handoverNotes: handoverNotes.trim() || undefined,
        },
        paymentProvider: 'stripe' as const,
        customerNotes: handoverNotes.trim() || undefined,
      };

      const res = await createCheckoutOrder(payload);

      if (res.checkoutUrl) {
        // Redirect directly to Stripe checkout session (or simulated test session)
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from payment provider.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setFormError(err.message || 'Failed to initiate checkout. Please verify details and try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitOrder} className="flex flex-col gap-8 bg-surface/90 border border-line p-6 sm:p-10">
      <div className="flex flex-col gap-2 border-b border-line pb-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
            Vehicle Reservation & Handover Dispatch
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="font-mono text-[11px] text-muted hover:text-fg transition-colors"
            >
              Back to Bag
            </button>
          )}
        </div>
        <h2 className="font-display text-[26px] sm:text-[32px] text-fg">
          Delivery & Payment Details
        </h2>
        <p className="font-body text-[13px] text-muted leading-relaxed">
          Please provide complete vehicle delivery and owner verification details so our handover concierge can allocate your build slot and coordinate transit.
        </p>
      </div>

      {formError && (
        <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 p-4 text-[13px] text-rose-300">
          <AlertCircle className="size-5 shrink-0 text-rose-400 mt-0.5" />
          <p>{formError}</p>
        </div>
      )}

      {/* SECTION 1: CUSTOMER & EMAIL VERIFICATION */}
      <div className="flex flex-col gap-5">
        <h3 className="font-display text-[18px] text-fg flex items-center gap-2 border-b border-line/60 pb-2">
          <User className="size-4 text-lime" />
          1. Owner Information & Email Verification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Muhammad Aazan"
              className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Phone Number (For Handover Driver) *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 03001234567 or +923001234567"
                className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <Phone className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Email & OTP Verification Box */}
        <div className="bg-ink/70 border border-line p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] text-muted uppercase flex items-center gap-1.5">
                  <Mail className="size-3 text-lime" />
                  Email Address (Verification Required) *
                </label>
                {isEmailVerified && (
                  <span className="font-mono text-[10px] text-lime flex items-center gap-1 font-semibold uppercase">
                    <Check className="size-3" /> Verified
                  </span>
                )}
              </div>
              <input
                type="email"
                required
                disabled={isEmailVerified}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                  setOtpSent(false);
                }}
                placeholder="e.g. name@example.com"
                className="w-full bg-surface border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime disabled:opacity-60"
              />
            </div>

            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || !email.includes('@')}
                className="h-[44px] px-5 bg-surface border border-line font-mono text-[11px] uppercase tracking-wider text-lime hover:border-lime disabled:opacity-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>{otpSent ? 'Resend Code' : 'Send Verification Code'}</span>
                )}
              </button>
            )}
          </div>

          {/* OTP Input Field */}
          {otpSent && !isEmailVerified && (
            <div className="mt-2 pt-3 border-t border-line/60 flex flex-col gap-2">
              <label className="font-mono text-[11px] text-muted uppercase">
                Enter 6-Digit Code Sent to Email:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-36 bg-surface border border-line px-3.5 py-2 font-mono text-[18px] tracking-widest text-center text-lime focus:outline-none focus:border-lime"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otpCode.length !== 6}
                  className="h-[42px] px-6 bg-lime text-night font-body text-[12px] font-semibold hover:bg-[#e0f48f] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {verifyingOtp ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  <span>Verify Email</span>
                </button>
              </div>

              {testOtpNotice && (
                <div className="mt-1 font-mono text-[11px] text-dim flex items-center gap-2">
                  <span className="text-lime">Developer / Test Mode Code:</span>
                  <span className="bg-surface px-2 py-0.5 border border-line text-lime font-bold">
                    {testOtpNotice}
                  </span>
                  <span className="text-[10px] text-muted">(Auto-filled for testing)</span>
                </div>
              )}
            </div>
          )}

          {otpMessage && (
            <p className="font-body text-[12px] text-lime mt-1">{otpMessage}</p>
          )}
          {otpError && (
            <p className="font-body text-[12px] text-rose-400 mt-1">{otpError}</p>
          )}
        </div>

        {/* CNIC / National ID */}
        <div>
          <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
            National ID / CNIC / Driving License (For Registration Paperwork)
          </label>
          <input
            type="text"
            value={nationalIdOrCnic}
            onChange={(e) => setNationalIdOrCnic(e.target.value)}
            placeholder="e.g. 42101-1234567-1 or State DL #"
            className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
          />
        </div>
      </div>

      {/* SECTION 2: VEHICLE DELIVERY ADDRESS */}
      <div className="flex flex-col gap-5">
        <h3 className="font-display text-[18px] text-fg flex items-center gap-2 border-b border-line/60 pb-2">
          <MapPin className="size-4 text-lime" />
          2. Vehicle Delivery Destination
        </h3>

        <div>
          <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
            Street Address Line 1 (House / Plot / Building #) *
          </label>
          <input
            type="text"
            required
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="e.g. House 42, Street 8, Phase 6"
            className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
            Address Line 2 (Apartment, Area, Sector, Nearest Landmark)
          </label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="e.g. DHA Phase 6 / Near Ocean Mall"
            className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">City *</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Karachi"
              className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">State / Province</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Sindh / CA"
              className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Postal Code</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 75600"
              className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg focus:outline-none focus:border-lime"
            >
              <option value="PK">Pakistan (PK)</option>
              <option value="US">United States (US)</option>
              <option value="AE">United Arab Emirates (AE)</option>
              <option value="GB">United Kingdom (GB)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: DELIVERY SCHEDULE & HANDOVER PREFERENCES */}
      <div className="flex flex-col gap-5">
        <h3 className="font-display text-[18px] text-fg flex items-center gap-2 border-b border-line/60 pb-2">
          <Calendar className="size-4 text-lime" />
          3. Handover Schedule & Vehicle Dispatch Instructions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Preferred Handover Date
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg focus:outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Preferred Handover Window
            </label>
            <select
              value={preferredTimeSlot}
              onChange={(e) => setPreferredTimeSlot(e.target.value as any)}
              className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg focus:outline-none focus:border-lime"
            >
              <option value="morning">Morning (9:00 AM – 12:00 PM)</option>
              <option value="afternoon">Afternoon (1:00 PM – 5:00 PM)</option>
              <option value="evening">Evening (5:00 PM – 8:00 PM)</option>
              <option value="anytime">Anytime during business hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
            Special Delivery Notes & Gate Access Instructions
          </label>
          <textarea
            rows={2}
            value={handoverNotes}
            onChange={(e) => setHandoverNotes(e.target.value)}
            placeholder="e.g. Gated community access code, call 1 hour before arrival, flatbed truck unloading instructions..."
            className="w-full bg-ink border border-line px-3.5 py-2 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime resize-none"
          />
        </div>
      </div>

      {/* SECTION 4: PAYMENT WITH STRIPE */}
      <div className="flex flex-col gap-4 border-t border-line pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[18px] text-fg flex items-center gap-2">
            <CreditCard className="size-4 text-lime" />
            4. Payment Method
          </h3>
          <span className="font-mono text-[11px] text-lime border border-lime/30 bg-lime/10 px-2.5 py-0.5 rounded">
            Stripe (Test Mode Active)
          </span>
        </div>

        <div className="border border-line bg-ink p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-surface border border-line text-lime">
              <Lock className="size-4" />
            </div>
            <div>
              <p className="font-body text-[14px] text-fg font-medium">Stripe Secure Checkout</p>
              <p className="font-mono text-[11px] text-muted">
                Encrypted 256-bit payment gateway · Test card & instant verification
              </p>
            </div>
          </div>
          <span className="font-mono text-[18px] text-lime font-bold">
            {formatPrice(subtotal, 'USD')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
          <ShieldCheck className="size-4 text-lime shrink-0" />
          <span>Includes Crown 100% refundable deposit guarantee & factory build warranty.</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !isEmailVerified}
          className="w-full inline-flex h-[56px] items-center justify-center gap-3 border border-transparent bg-lime px-8 font-body text-[14px] font-semibold text-night transition-colors hover:bg-[#e0f48f] disabled:opacity-50 mt-2"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Initiating Stripe Payment...</span>
            </>
          ) : !isEmailVerified ? (
            <>
              <Mail className="size-4" />
              <span>Verify Email Above to Proceed with Payment</span>
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              <span>Proceed to Stripe Payment ({formatPrice(subtotal, 'USD')}) ↗</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
