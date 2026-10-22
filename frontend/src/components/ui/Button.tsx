import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'dark';

const variants: Record<Variant, string> = {
  primary: 'border-transparent bg-lime text-night hover:bg-[#e0f48f]',
  secondary: 'border-line bg-transparent text-fg hover:border-fg',
  dark: 'border-transparent bg-night text-fg hover:bg-[#262e22]',
};

const base =
  'inline-flex h-[52px] items-center justify-center gap-[22px] whitespace-nowrap border border-solid px-[22px] font-body text-[12px] font-medium transition-colors duration-300';

type Props = { variant?: Variant; icon?: boolean; className?: string; children: React.ReactNode };

export function Button({ href, variant = 'primary', icon = true, className, children }: Props & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
      {icon && <ArrowUpRight className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />}
    </Link>
  );
}

export function ButtonAction({
  variant = 'primary', icon = true, className, children, ...rest
}: Props & Omit<React.ComponentProps<'button'>, keyof Props>) {
  return (
    <button className={cn(base, variants[variant], 'disabled:opacity-50', className)} {...rest}>
      {children}
      {icon && <ArrowUpRight className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />}
    </button>
  );
}
