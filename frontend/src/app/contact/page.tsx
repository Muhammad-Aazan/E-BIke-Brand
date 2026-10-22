'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Phone, MapPin, CheckCircle, Clock, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { brand } from '@/config/brand';
import { submitContact } from '@/lib/api/contact';
import { useAuth } from '@/components/providers/AuthProvider';

function ContactContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requestType: 'test_ride' as 'contact' | 'booking' | 'test_ride' | 'service',
    model: 'sovereign-r',
    preferredDate: '',
    location: 'Karachi Atelier Showroom',
    notes: '',
  });

  useEffect(() => {
    const modelParam = searchParams.get('model');
    const typeParam = searchParams.get('type');
    setFormData((prev) => ({
      ...prev,
      name: user?.name || prev.name,
      email: user?.email || prev.email,
      phone: (user as any)?.phone || prev.phone,
      model: modelParam || prev.model,
      requestType: (typeParam as any) || prev.requestType,
    }));
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const subject =
      formData.requestType === 'test_ride'
        ? `Test Ride Request: ${formData.model.toUpperCase()} at ${formData.location}`
        : formData.requestType === 'booking'
        ? `Vehicle Booking Consultation: ${formData.model.toUpperCase()}`
        : `Customer Inquiry from ${formData.name}`;

    const message = [
      formData.notes ? `Customer Note: ${formData.notes}` : '',
      formData.model ? `Model Selected: ${formData.model}` : '',
      formData.preferredDate ? `Preferred Date/Time: ${formData.preferredDate}` : '',
      formData.location ? `Preferred Location: ${formData.location}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await submitContact({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        subject,
        message: message || 'Booking request submitted from website contact form.',
        requestType: formData.requestType,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please verify details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section bg="bg-ink" inner="flex flex-col gap-14 px-[22px] py-14 lg:gap-20 lg:px-16 lg:py-24">
      <div className="flex flex-col gap-4">
        <Eyebrow>EXPERIENCE {brand.upper} {brand.descriptor}</Eyebrow>
        <h1 className="font-display text-[42px] leading-[1.08] text-fg lg:text-[68px]">
          Book a test ride or connect with our concierge.
        </h1>
        <p className="max-w-[560px] font-body text-[15px] leading-[1.7] text-muted">
          Feel the instantaneous electric torque on road. Book a private test ride or consultation and our team will coordinate time and location.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left: Interactive Form */}
        <div className="border border-line bg-surface/70 p-6 sm:p-10 lg:col-span-7">
          {submitted ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <CheckCircle className="mb-4 size-14 text-lime" />
              <h2 className="mb-2 font-display text-[28px] text-fg">Request Received & Dispatched</h2>
              <p className="max-w-[440px] font-body text-[14px] leading-[1.7] text-muted">
                Thank you, <span className="text-fg font-medium">{formData.name}</span>. Your request has been forwarded directly to our operations team. We will review your preferred date and contact you with the confirmed handover time and showroom slot.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="border border-line px-5 py-2.5 font-mono text-[11px] text-fg transition-colors hover:border-lime hover:text-lime"
                >
                  Submit Another Request
                </button>
                {user && (
                  <a
                    href="/account"
                    className="bg-lime text-night px-5 py-2.5 font-mono text-[11px] font-semibold hover:bg-[#e0f48f] transition-colors"
                  >
                    View in My Account ↗
                  </a>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h2 className="font-display text-[22px] text-fg">Reserve your session</h2>
                <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
                  Live Concierge Dispatch
                </span>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[13px]">
                  <AlertCircle className="size-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Request Type Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] uppercase text-muted">
                  Request Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'test_ride', label: 'Test Ride' },
                    { id: 'booking', label: 'Vehicle Booking' },
                    { id: 'service', label: 'Service / Warranty' },
                    { id: 'contact', label: 'General Inquiry' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, requestType: t.id as any })}
                      className={`py-2 px-3 rounded text-[12px] font-mono transition-colors border text-center ${
                        formData.requestType === t.id
                          ? 'bg-lime text-night border-lime font-bold'
                          : 'bg-ink border-line text-muted hover:text-fg'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="font-mono text-[11px] uppercase text-muted">
                    Full Legal Name *
                  </label>
                  <input
                    id="name"
                    required
                    type="text"
                    placeholder="Muhammad Aazan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border border-line bg-ink px-4 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:border-lime focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-mono text-[11px] uppercase text-muted">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border border-line bg-ink px-4 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:border-lime focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Model */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="font-mono text-[11px] uppercase text-muted">
                    Phone Number (for booking coordinator) *
                  </label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    placeholder="03001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border border-line bg-ink px-4 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:border-lime focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="model" className="font-mono text-[11px] uppercase text-muted">
                    Select Vehicle / Model *
                  </label>
                  <select
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="border border-line bg-ink px-4 py-3 font-body text-[14px] text-fg focus:border-lime focus:outline-none"
                  >
                    <option value="sovereign-r">Sovereign R (Grand Tourer)</option>
                    <option value="vector-s">Vector S (City Precision)</option>
                    <option value="nomad-x">Nomad X (All-Terrain)</option>
                    <option value="evee-pro-125">EVee Pro 125 Electric Motorcycle</option>
                    <option value="evee-city-commuter">EVee City Commuter</option>
                    <option value="custom-consultation">Other / Custom Build Consultation</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Preferred Date + Preferred Location */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="preferredDate" className="font-mono text-[11px] uppercase text-muted flex items-center gap-1.5">
                    <Calendar className="size-3 text-lime" />
                    Preferred Date & Time Window
                  </label>
                  <input
                    id="preferredDate"
                    type="text"
                    placeholder="e.g. Saturday afternoon, 3:00 PM"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="border border-line bg-ink px-4 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:border-lime focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="location" className="font-mono text-[11px] uppercase text-muted flex items-center gap-1.5">
                    <MapPin className="size-3 text-lime" />
                    Preferred City / Showroom
                  </label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border border-line bg-ink px-4 py-3 font-body text-[14px] text-fg focus:border-lime focus:outline-none"
                  >
                    <option value="Karachi Atelier Showroom">Karachi Atelier Showroom (DHA Phase 6)</option>
                    <option value="Lahore Experience Center">Lahore Experience Center (Gulberg III)</option>
                    <option value="Islamabad Concierge Desk">Islamabad Concierge Desk (Blue Area)</option>
                    <option value="Doorstep Test Ride">Doorstep Test Ride (Driver Dispatched to You)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <label htmlFor="notes" className="font-mono text-[11px] uppercase text-muted">
                  Questions, Specific Requests or Rider Experience
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Tell us about any specific questions, range requirements, or preferred trial routes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border border-line bg-ink px-4 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:border-lime focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-[52px] items-center justify-center gap-2 border border-transparent bg-lime px-8 font-body text-[13px] font-semibold text-night transition-colors duration-200 hover:bg-[#e0f48f] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Transmitting Request to Concierge...</span>
                  </>
                ) : (
                  <span>Submit Request to Concierge ↗</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Studio & Concierge info */}
        <div className="flex flex-col justify-between gap-8 lg:col-span-5">
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-[26px] text-fg">Direct Concierge</h2>
            <p className="font-body text-[14px] leading-[1.7] text-muted">
              Have questions regarding bespoke specifications, corporate fleet inquiries, or dealership opportunities? Our executive advisors are at your service.
            </p>

            <div className="flex flex-col gap-4 border-t border-line pt-6 font-body text-[14px]">
              <div className="flex items-start gap-3 text-fg">
                <MapPin className="mt-1 size-4 shrink-0 text-lime" />
                <div>
                  <p className="font-medium">{brand.name} {brand.descriptor} Flagship Atelier</p>
                  <p className="text-muted">Main Shahrah-e-Faisal / DHA, Karachi, Pakistan</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-fg">
                <Phone className="size-4 shrink-0 text-lime" />
                <a href="tel:+923001234567" className="text-muted hover:text-fg transition-colors">
                  +92 (300) 123-4567
                </a>
              </div>

              <div className="flex items-center gap-3 text-fg">
                <Mail className="size-4 shrink-0 text-lime" />
                <a href="mailto:support@evee.pk" className="text-muted hover:text-fg transition-colors">
                  support@evee.pk / concierge@evee.pk
                </a>
              </div>

              <div className="flex items-center gap-3 text-fg">
                <Clock className="size-4 shrink-0 text-lime" />
                <span className="text-muted">Mon – Sat: 09:00 – 19:00 PKT</span>
              </div>
            </div>
          </div>

          <div className="border border-line bg-surface p-6 font-mono text-[11px] leading-[1.7] text-muted">
            <p className="text-fg font-medium mb-1">Rider Handover Protocol:</p>
            <p>A valid driver’s license or CNIC is verified prior to all street trial runs. Professional safety helmet and protective equipment are provided complimentary by our handover crew.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink flex items-center justify-center font-mono text-lime">Loading contact atelier...</div>}>
      <ContactContent />
    </Suspense>
  );
}
