'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { brand } from '@/config/brand';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const emailParam = searchParams.get('email') || '';

  const { login } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      router.push(redirect);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <Section bg="bg-ink" inner="flex flex-col items-center justify-center px-[22px] py-16 sm:py-24 max-w-[480px] mx-auto">
      <div className="w-full flex flex-col gap-8 bg-surface/80 border border-line p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col gap-2 text-center">
          <Eyebrow>{brand.upper} MEMBERSHIP</Eyebrow>
          <h1 className="font-display text-[32px] sm:text-[38px] text-fg">
            Sign In to Atelier
          </h1>
          <p className="font-body text-[13px] text-muted">
            Access your reserved motorcycles, build slot status, and white-glove telematics.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 p-3.5 text-[13px] text-rose-300">
            <AlertCircle className="size-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <Mail className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[11px] text-muted uppercase">Password</label>
              <Link
                href="/forgot-password"
                className="font-mono text-[11px] text-dim hover:text-lime transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <Lock className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-lime text-night font-semibold text-[13px] hover:bg-[#e0f48f] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-line pt-6 text-center">
          <p className="font-body text-[13px] text-muted">
            Don’t have a Crown account yet?{' '}
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirect)}`}
              className="text-lime hover:underline font-medium"
            >
              Create Account ↗
            </Link>
          </p>
        </div>
      </div>
    </Section>
  );
}
