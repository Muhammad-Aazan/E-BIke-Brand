import { Eyebrow } from '@/components/ui/Eyebrow';
import { Photo } from '@/components/ui/Photo';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { brand } from '@/config/brand';

export const metadata = {
  title: 'Our Story',
  description: `The vision and engineering principles behind ${brand.name} ${brand.descriptor}.`,
};

export default function AboutPage() {
  return (
    <Section bg="bg-ink" inner="flex flex-col gap-16 px-[22px] py-16 lg:gap-24 lg:px-16 lg:py-24">
      {/* Hero section */}
      <div className="flex flex-col gap-6 lg:w-[860px]">
        <Eyebrow>OUR STORY — {brand.upper} {brand.descriptor}</Eyebrow>
        <h1 className="font-display text-[44px] leading-[1.06] text-fg sm:text-[56px] lg:text-[76px]">
          We set out to remove the noise. Not the feeling.
        </h1>
        <p className="font-body text-[16px] leading-[1.8] text-muted lg:text-[18px]">
          At {brand.name} {brand.descriptor}, we believe true performance is not measured in engine roar or excessive complexity. It is found in pure, unfiltered connection between rider, machine, and the open road.
        </p>
      </div>

      {/* Featured visual */}
      <div className="relative h-[320px] w-full overflow-hidden bg-surface sm:h-[460px] lg:h-[580px]">
        <Photo
          src="/images/home/freedom-d.png"
          mobileSrc="/images/home/freedom-m.png"
          alt="Rider carving coastal roads"
          priority
        />
      </div>

      {/* Philosophy Pillars */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-4 border-t border-line pt-6">
          <span className="font-mono text-[12px] text-lime">01 / ARCHITECTURE</span>
          <h2 className="font-display text-[26px] text-fg">Integrated mass centralization</h2>
          <p className="font-body text-[14px] leading-[1.7] text-muted">
            By building our structural battery enclosure directly into the frame, {brand.name} motorcycles deliver exceptionally low center of gravity and flickable responsiveness.
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-line pt-6">
          <span className="font-mono text-[12px] text-lime">02 / CRAFTSMANSHIP</span>
          <h2 className="font-display text-[26px] text-fg">Aerospace-grade materials</h2>
          <p className="font-body text-[14px] leading-[1.7] text-muted">
            Forged aluminum subframes, carbon-fiber composite panels, and weather-sealed telematics ensure every component endures thousands of hard miles.
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-line pt-6">
          <span className="font-mono text-[12px] text-lime">03 / SUSTAINABILITY</span>
          <h2 className="font-display text-[26px] text-fg">Zero-emissions conviction</h2>
          <p className="font-body text-[14px] leading-[1.7] text-muted">
            Clean energy without sacrificial trade-offs. 95% recyclable battery cells, maintenance-free belt drives, and zero tailpipe emissions.
          </p>
        </div>
      </div>

      {/* Atelier detail with photo */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative h-[320px] w-full overflow-hidden bg-surface sm:h-[400px]">
          <Photo
            src="/images/home/powertrain-d.png"
            mobileSrc="/images/home/powertrain-m.png"
            alt="Crown electric powertrain detail"
          />
        </div>
        <div className="flex flex-col gap-6">
          <Eyebrow>ENGINEERING PURSUIT</Eyebrow>
          <h2 className="font-display text-[32px] leading-[1.15] text-fg lg:text-[42px]">
            Every watt tuned for maximum instinct.
          </h2>
          <p className="font-body text-[15px] leading-[1.7] text-muted">
            Each {brand.name} motorcycle is inspected, calibrated, and road-tested before delivery. Whether you navigate busy metropolitan streets or endless coastal ribbons, our machines respond instantaneously to your intention.
          </p>
          <div className="flex gap-4 pt-2">
            <Button href="/products">Explore Motorcycles</Button>
            <Button href="/contact" variant="secondary">Book Test Ride</Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
