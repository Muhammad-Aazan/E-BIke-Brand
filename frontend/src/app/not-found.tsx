import Link from 'next/link';
import { Compass, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { brand } from '@/config/brand';

export default function NotFound() {
  const quickLinks = [
    { label: 'Sovereign R', desc: 'The Electric Grand Tourer', href: '/products/sovereign-r' },
    { label: 'Vector S', desc: 'Urban Precision Machine', href: '/products/vector-s' },
    { label: 'Nomad X', desc: 'All-Terrain Exploration', href: '/products/nomad-x' },
    { label: 'Book a Test Ride', desc: 'Experience the electric thrill', href: '/contact' },
  ];

  return (
    <Section bg="bg-ink" inner="relative flex min-h-[75vh] flex-col justify-center px-[22px] py-20 lg:px-16 lg:py-28 overflow-hidden">
      {/* Subtle radial ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-lime/5 blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5">
          <Compass className="size-3.5 text-lime animate-spin-slow" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Error 404 · Uncharted Route
          </span>
        </div>

        <p className="select-none font-display text-[96px] font-medium leading-none tracking-tight text-white/10 lg:text-[180px]">
          404
        </p>

        <h1 className="-mt-6 mb-4 font-display text-[34px] leading-[1.1] text-fg sm:text-[48px] lg:-mt-10 lg:text-[60px]">
          The road ended here.
        </h1>

        <p className="mb-10 max-w-[540px] font-body text-[15px] leading-[1.7] text-muted lg:text-[16px]">
          The page or path you are looking for has been moved, renamed, or does not exist in the {brand.name} {brand.descriptor} network. Let us get you back in gear.
        </p>

        <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
          <Button href="/">Return to Home</Button>
          <Button href="/products" variant="secondary">Browse Collection</Button>
        </div>

        {/* Suggested routes */}
        <div className="w-full border-t border-line/80 pt-10 text-left">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-widest text-muted">
            Recommended Destinations
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center justify-between border border-line bg-surface/50 p-4 transition-all duration-300 hover:border-lime/60 hover:bg-surface"
              >
                <div>
                  <p className="font-display text-[17px] text-fg transition-colors duration-200 group-hover:text-lime">
                    {item.label}
                  </p>
                  <p className="font-mono text-[10px] text-muted">{item.desc}</p>
                </div>
                <ArrowUpRight
                  className="size-4 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"
                  strokeWidth={1.5}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
