'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, Loader2, Check, LogIn } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { brand } from '@/config/brand';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConflict(false);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError('Password must meet all complexity requirements below.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
      });
      router.push(redirect);
    } catch (err: any) {
      console.error('Registration error:', err);
      const isDuplicate =
        err.status === 409 ||
        err.message?.toLowerCase().includes('already exists') ||
        err.message?.toLowerCase().includes('conflict');

      if (isDuplicate) {
        setIsConflict(true);
        setError(`An account with the email "${email.trim()}" is already registered.`);
      } else {
        setError(err.message || 'Failed to create account. Please check inputs.');
      }
      setLoading(false);
    }
  };

  return (
    <Section bg="bg-ink" inner="flex flex-col items-center justify-center px-[22px] py-16 sm:py-24 max-w-[520px] mx-auto">
      <div className="w-full flex flex-col gap-8 bg-surface/80 border border-line p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col gap-2 text-center">
          <Eyebrow>{brand.upper} MEMBERSHIP</Eyebrow>
          <h1 className="font-display text-[32px] sm:text-[38px] text-fg">
            Create Crown Account
          </h1>
          <p className="font-body text-[13px] text-muted">
            Join the Crown Motors collective. Configure atelier builds, track dispatch, and manage warranties.
          </p>
        </div>

        {error && (
          <div className="flex flex-col gap-3 bg-rose-500/10 border border-rose-500/30 p-4 text-[13px] text-rose-300">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>

            {isConflict && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-rose-500/20">
                <Link
                  href={`/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] transition-colors"
                >
                  <LogIn className="size-3.5" />
                  <span>Sign In with this Email</span>
                </Link>
                <Link
                  href="/forgot-password"
                  className="font-mono text-[11px] text-muted hover:text-fg text-center py-1.5 transition-colors underline"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Full Legal Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Muhammad Aazan"
                className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <User className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsConflict(false);
                }}
                placeholder="name@example.com"
                className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <Mail className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Phone Number (Optional - for delivery dispatch)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567 or +923001234567"
                className="w-full bg-ink border border-line px-3.5 py-2.5 font-body text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <Phone className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Password *
            </label>
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

            {/* Password Validation Checklist */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-lime' : 'text-dim'}`}>
                <Check className={`size-3 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
                8+ Characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-lime' : 'text-dim'}`}>
                <Check className={`size-3 ${hasUppercase ? 'opacity-100' : 'opacity-30'}`} />
                1 Uppercase (A-Z)
              </span>
              <span className={`flex items-center gap-1.5 ${hasLowercase ? 'text-lime' : 'text-dim'}`}>
                <Check className={`size-3 ${hasLowercase ? 'opacity-100' : 'opacity-30'}`} />
                1 Lowercase (a-z)
              </span>
              <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-lime' : 'text-dim'}`}>
                <Check className={`size-3 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                1 Number (0-9)
              </span>
              <span className={`col-span-2 flex items-center gap-1.5 ${hasSpecial ? 'text-lime' : 'text-dim'}`}>
                <Check className={`size-3 ${hasSpecial ? 'opacity-100' : 'opacity-30'}`} />
                1 Special character (!@#$%^&*)
              </span>
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
                <span>Creating Crown Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-line pt-6 text-center">
          <p className="font-body text-[13px] text-muted">
            Already have a Crown Atelier account?{' '}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-lime hover:underline font-medium"
            >
              Sign In ↗
            </Link>
          </p>
        </div>
      </div>
    </Section>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink flex items-center justify-center font-mono text-lime">Loading registration...</div>}>
      <SignupContent />
    </Suspense>
  );
}
