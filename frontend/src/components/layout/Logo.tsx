import Link from 'next/link';
import { brand } from '@/config/brand';
import { cn } from '@/lib/cn';

/** Placeholder emblem – replaced automatically when brand.logoSrc is set. */
function BrandMark() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none" aria-hidden className="shrink-0 text-fg">
      <path d="M19 0 5 14h9l-4 10 17-15h-9z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${brand.name} ${brand.descriptor} – home`}
      className={cn('flex items-center gap-3 transition-opacity hover:opacity-90', className)}
    >
      {brand.logoSrc ? (
        <div className="flex items-center justify-center rounded bg-white px-2.5 py-1 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logoSrc}
            alt={`${brand.name} ${brand.descriptor}`}
            className="h-8 lg:h-9 w-auto object-contain"
          />
        </div>
      ) : (
        <>
          <BrandMark />
          <span className="flex flex-col gap-px leading-[normal]">
            <span className="font-display text-[19px] font-semibold text-fg">{brand.upper}</span>
            <span className="font-mono text-[7px] text-muted">{brand.descriptor}</span>
          </span>
        </>
      )}
    </Link>
  );
}
