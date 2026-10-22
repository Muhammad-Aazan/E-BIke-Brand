'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Bike,
  Users,
  Tag,
  BarChart3,
  MessageSquare,
  ChevronRight,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';

const menuItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders & Handover', icon: Package },
  { href: '/products', label: 'Products & Inventory', icon: Bike },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/contact', label: 'Bookings & Contact', icon: MessageSquare },
  { href: '/coupons', label: 'Coupons & Promos', icon: Tag },
  { href: '/analytics', label: 'Analytics & Trends', icon: BarChart3 },
  { href: '/profile', label: 'My Profile & Security', icon: UserCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  return (
    <aside className="w-64 bg-night border-r border-line flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-line px-6 flex items-center gap-3">
          <div className="size-8 rounded bg-lime/10 border border-lime/30 flex items-center justify-center text-lime font-bold text-[14px]">
            ⚡
          </div>
          <div>
            <span className="font-bold text-[14px] text-fg tracking-wider uppercase block">
              EVee Crown
            </span>
            <span className="font-mono text-[10px] text-lime uppercase tracking-widest block">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 flex flex-col gap-1">
          <span className="px-3 py-2 font-mono text-[10px] uppercase text-dim tracking-wider">
            Management
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-surface text-lime border border-line'
                    : 'text-muted hover:text-fg hover:bg-surface/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`size-4 ${active ? 'text-lime' : 'text-dim'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="size-3 text-lime" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile Card */}
      <div className="p-4 border-t border-line flex flex-col gap-3">
        {admin && (
          <Link
            href="/profile"
            className="flex items-center justify-between p-2 rounded-lg bg-surface/40 hover:bg-surface transition-colors border border-line group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="size-8 rounded-full bg-surface border border-line shrink-0 overflow-hidden flex items-center justify-center text-lime font-bold text-[12px]">
                {admin.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={admin.avatarUrl} alt={admin.name} className="size-full object-cover" />
                ) : (
                  <span>{admin.name?.charAt(0).toUpperCase() || 'A'}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-[12px] font-semibold text-fg block truncate group-hover:text-lime transition-colors">
                  {admin.name || 'Admin'}
                </span>
                <span className="text-[10px] font-mono text-dim block uppercase">
                  Superadmin
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
              }}
              title="Sign Out"
              className="text-muted hover:text-rose-400 p-1.5 transition-colors"
            >
              <LogOut className="size-3.5" />
            </button>
          </Link>
        )}

        <div className="bg-surface/60 border border-line p-2.5 rounded text-[11px] font-mono text-muted flex items-center gap-2">
          <span className="size-2 rounded-full bg-lime animate-pulse" />
          <span>ImageKit: Connected</span>
        </div>
      </div>
    </aside>
  );
}
