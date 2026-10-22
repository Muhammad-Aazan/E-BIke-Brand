'use client';

import { useAdminAuth } from '@/lib/auth';
import { LogOut, ShieldAlert, User, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const { admin, logout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-line bg-night/80 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-muted uppercase">Environment:</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-lime/10 text-lime border border-lime/30 uppercase font-semibold">
          Production / Live
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-r border-line pr-6">
          <div className="size-8 rounded-full bg-surface border border-line flex items-center justify-center text-lime font-bold text-[12px]">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="text-right">
            <span className="text-[13px] font-medium text-fg block leading-tight">
              {admin?.name || 'EVee Administrator'}
            </span>
            <span className="text-[11px] font-mono text-dim block leading-tight">
              {admin?.email || 'admin@evee.pk'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-muted hover:text-rose-400 font-mono text-[11px] uppercase tracking-wider transition-colors"
          title="Sign Out of Admin Console"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
