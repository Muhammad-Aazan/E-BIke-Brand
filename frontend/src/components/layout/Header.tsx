'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X, User as UserIcon } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { pad2 } from '@/lib/format';
import { cn } from '@/lib/cn';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products?type=motorcycle', label: 'Motorcycles' },
  { href: '/products?type=accessory', label: 'Accessories' },
  { href: '/about', label: 'Our story' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center justify-between px-[22px] lg:h-[96px] lg:px-16">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {links.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn('flex flex-col gap-[9px] text-[12px] transition-colors duration-300 hover:text-lime', active ? 'text-lime' : 'text-fg')}
              >
                {label}
                {active && <span className="h-px w-4 bg-lime" aria-hidden />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5 lg:gap-7">
          <Link href="/contact" className="hidden text-[12px] text-fg transition-colors duration-300 hover:text-lime lg:block">
            Book a test ride ↗
          </Link>

          {/* User Account / Login Button */}
          {user ? (
            <Link
              href="/account"
              className="flex items-center gap-2 text-[12px] text-fg transition-colors duration-300 hover:text-lime font-mono"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-6 rounded-full object-cover border border-lime/50 shrink-0"
                />
              ) : (
                <UserIcon className="size-4 text-lime" />
              )}
              <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[12px] text-fg transition-colors duration-300 hover:text-lime font-mono uppercase tracking-wider"
            >
              Sign In
            </Link>
          )}

          <Link href="/cart" aria-label={`Cart, ${count} items`} className="flex items-center gap-[6px]">
            <ShoppingBag className="size-5 text-fg" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-[10px] text-lime">{pad2(count)}</span>
          </Link>
          <button
            type="button"
            className="lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5 text-fg" strokeWidth={1.5} /> : <Menu className="size-5 text-fg" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu – no frame for this in Figma, built from the same tokens */}
      {open && (
        <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 top-[76px] z-40 flex flex-col gap-2 bg-ink px-[22px] pt-8 lg:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn('border-b border-line py-5 font-display text-[38px] leading-[1.08]', isActive(href) ? 'text-lime' : 'text-fg')}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact" className="pt-6 text-[12px] text-fg">Book a test ride ↗</Link>
        </nav>
      )}
    </header>
  );
}
