import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Photo } from '@/components/ui/Photo';
import { HeroMotion } from './HeroMotion';
import { brand } from '@/config/brand';

export function Hero() {
  return (
    <section aria-label="Hero" className="relative flex w-full flex-col items-start overflow-hidden bg-ink lg:h-[790px]">
      <div data-hero="image" className="relative order-2 h-[280px] w-full lg:absolute lg:inset-0 lg:order-none lg:h-full">
        <Photo src="/images/home/hero-d.png" mobileSrc="/images/home/hero-m.png" alt="Electric motorcycle on the open road" priority />
      </div>
      <div aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(12,14,14,0.73)_0%,rgba(12,14,14,0)_60%,rgba(12,14,14,0)_100%)] lg:block" />

      <div data-hero="headline" className="relative z-10 order-1 flex w-full flex-col items-start gap-6 px-[22px] pt-[42px] lg:w-[780px] lg:pl-16 lg:pr-0 lg:pt-16">
        <Eyebrow>ELECTRIC BY DESIGN. {brand.upper} BY NATURE.</Eyebrow>
        <h1 className="font-display text-[50px] font-normal leading-[1.08] text-fg lg:text-[112px]">
          <span className="block">Less noise.</span>
          <span className="block">More instinct.</span>
        </h1>
        <p className="w-full font-body text-[15px] leading-[1.7] text-muted lg:w-[360px]">
          All-electric motorcycles for those who feel the road differently.
        </p>
      </div>

      <div data-hero="actions" className="relative z-10 order-3 flex w-full gap-4 px-[22px] pb-9 lg:px-16 lg:pb-0 lg:pt-[38px]">
        <Button href="/products" className="flex-1 lg:flex-none">Explore the collection</Button>
        <Button href="/contact" variant="secondary" className="hidden lg:inline-flex">Book a test ride</Button>
      </div>

      <div data-hero="marker" className="absolute inset-x-16 bottom-9 z-10 hidden items-end justify-between lg:flex">
        <div className="flex flex-col gap-[9px]">
          <p className="font-mono text-[10px] leading-[1.5] text-muted">01 / 03 — THE SOVEREIGN R</p>
          <div className="flex gap-[6px]" aria-hidden>
            <span className="h-[2px] w-12 bg-lime" />
            <span className="h-[2px] w-6 bg-dim" />
            <span className="h-[2px] w-6 bg-dim" />
          </div>
        </div>
        <p className="font-mono text-[10px] leading-[1.5] text-muted">SCROLL TO DISCOVER ↓</p>
      </div>

      <HeroMotion />
    </section>
  );
}
