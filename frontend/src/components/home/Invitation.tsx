import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Photo } from '@/components/ui/Photo';
import { brand } from '@/config/brand';

export function Invitation() {
  return (
    <section className="relative h-[520px] w-full overflow-hidden bg-ink lg:h-[560px]">
      <Photo src="/images/home/house-d.png" mobileSrc="/images/home/house-m.png" alt="" />
      <div aria-hidden className="absolute inset-0 bg-[rgba(12,14,14,0.77)]" />
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col items-start justify-center gap-[26px] px-[22px] py-16 lg:px-16 lg:py-24">
        <Eyebrow data-reveal>THE ROAD IS CALLING</Eyebrow>
        <h2 data-reveal className="font-display text-[48px] leading-[1.08] text-fg lg:text-[80px]">
          <span className="block">Some things</span>
          <span className="block">have to be felt.</span>
        </h2>
        <p data-reveal className="font-body text-[15px] leading-[1.7] text-muted lg:w-[420px]">
          Meet your {brand.name}. Book a private test ride at {brand.name} House, {brand.city}.
        </p>
        <Button href="/contact">Book your test ride</Button>
      </div>
    </section>
  );
}
