'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { forgotPassword } from '@/lib/api/auth';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section bg="bg-ink" inner="flex flex-col items-center justify-center px-[22px] py-16 sm:py-24 max-w-[480px] mx-auto">
      <div className="w-full flex flex-col gap-6 bg-surface/80 border border-line p-6 sm:p-10 shadow-2xl">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-muted hover:text-lime transition-colors mb-4"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Sign In</span>
          </Link>
          <Eyebrow>SECURITY RECOVERY</Eyebrow>
          <h1 className="font-display text-[28px] sm:text-[34px] text-fg mt-1">
            Reset Password
          </h1>
          <p className="font-body text-[13px] text-muted mt-2">
            Enter your account email to receive a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-4 bg-ink/70 border border-line p-6">
            <CheckCircle2 className="size-10 text-lime" />
            <p className="font-medium text-fg">Recovery Link Dispatched</p>
            <p className="text-[13px] text-muted leading-relaxed">
              If an account is associated with <span className="text-lime">{email}</span>, a secure password reset link has been dispatched.
            </p>
            <Link
              href="/login"
              className="mt-2 text-[12px] font-mono text-lime hover:underline"
            >
              Return to Sign In ↗
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-3 text-[13px] text-rose-300">
                <AlertCircle className="size-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-ink border border-line px-3.5 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                />
                <Mail className="absolute right-3.5 top-3.5 size-4 text-dim pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-lime text-night font-body text-[13px] font-semibold hover:bg-[#e0f48f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
