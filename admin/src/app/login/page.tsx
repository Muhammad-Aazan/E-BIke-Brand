'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('admin@evee.pk');
  const [password, setPassword] = useState('Admin@123456!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push('/');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Invalid administrator credentials. Access restricted.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#12141a] border border-[#232733] p-8 sm:p-10 rounded-xl shadow-2xl flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="size-12 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime text-[22px] mb-2 shadow-lg shadow-lime/5">
            ⚡
          </div>
          <span className="font-mono text-[10px] text-lime border border-lime/30 bg-lime/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            Restricted Admin Portal
          </span>
          <h1 className="font-bold text-[24px] text-fg tracking-tight">
            EVee Crown Motors
          </h1>
          <p className="text-[13px] text-muted">
            Executive Fleet & Operations Dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 p-3.5 rounded text-[13px] text-rose-300">
            <ShieldAlert className="size-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@evee.pk"
                className="w-full bg-[#181b23] border border-[#282c38] px-3.5 py-2.5 rounded text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <Mail className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#181b23] border border-[#282c38] px-3.5 py-2.5 rounded text-[14px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
              />
              <Lock className="absolute right-3.5 top-3 size-4 text-dim pointer-events-none" />
            </div>
          </div>

          {/* Quick Credential Helper Button */}
          <button
            type="button"
            onClick={() => {
              setEmail('admin@evee.pk');
              setPassword('Admin@123456!');
            }}
            className="text-left font-mono text-[11px] text-dim hover:text-lime transition-colors flex items-center gap-1.5 pt-1"
          >
            <Sparkles className="size-3 text-lime" />
            <span>Auto-fill seeded admin credentials</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-lime text-night font-semibold text-[13px] rounded hover:bg-[#e0f48f] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-lg shadow-lime/10"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Authenticating Console...</span>
              </>
            ) : (
              <>
                <span>Access Admin Console</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-[#232733] pt-4 text-center">
          <p className="font-mono text-[10px] text-dim">
            Authorized Personnel Only · 256-Bit Encrypted Session
          </p>
        </div>
      </div>
    </div>
  );
}
