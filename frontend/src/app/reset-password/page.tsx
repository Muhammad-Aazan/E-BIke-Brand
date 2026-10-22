'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { resetPassword } from '@/lib/api/auth';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section bg="bg-ink" inner="flex flex-col items-center justify-center px-[22px] py-16 sm:py-24 max-w-[480px] mx-auto">
      <div className="w-full flex flex-col gap-6 bg-surface/80 border border-line p-6 sm:p-10 shadow-2xl">
        <div>
          <Eyebrow>SECURITY RECOVERY</Eyebrow>
          <h1 className="font-display text-[28px] sm:text-[34px] text-fg mt-1">
            Set New Password
          </h1>
          <p className="font-body text-[13px] text-muted mt-2">
            Choose a strong new password for your Crown Motors account.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center text-center gap-4 bg-ink/70 border border-line p-6">
            <CheckCircle2 className="size-10 text-lime" />
            <p className="font-medium text-fg">Password Reset Successfully</p>
            <p className="text-[13px] text-muted">
              Redirecting you to the sign in page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-3 text-[13px] text-rose-300">
                <AlertCircle className="size-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-ink border border-line px-3.5 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                />
                <Lock className="absolute right-3.5 top-3.5 size-4 text-dim pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-ink border border-line px-3.5 py-3 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                />
                <Lock className="absolute right-3.5 top-3.5 size-4 text-dim pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-lime text-night font-body text-[13px] font-semibold hover:bg-[#e0f48f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center font-mono text-lime">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
