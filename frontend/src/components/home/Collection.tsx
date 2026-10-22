import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ProductCard } from '@/components/ui/ProductCard';
import { Section } from '@/components/ui/Section';
import { brand } from '@/config/brand';
import type { Product } from '@/lib/api/types';

export function Collection({ products }: { products: Product[] }) {
  return (
    <Section bg="bg-ink" inner="flex flex-col gap-8 px-[22px] py-16 lg:gap-12 lg:px-16 lg:py-[104px]">
      <Eyebrow data-reveal>01 — FIND YOUR FREQUENCY</Eyebrow>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <h2 data-reveal className="font-display text-[38px] leading-[1.08] text-fg lg:flex-1 lg:text-[64px]">
          <span className="block">Three expressions.</span>
          <span className="block">One electric soul.</span>
        </h2>
        <div data-reveal className="flex w-full flex-col items-start gap-5 lg:w-[350px] lg:shrink-0">
          <p className="font-body text-[15px] leading-[1.7] text-muted">
            From the everyday escape to the road less travelled. Find the {brand.name} that moves you.
          </p>
          <Button href="/products" variant="secondary">All motorcycles</Button>
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-6">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <p className="font-body text-[12px] leading-[1.7] text-muted">
        Range shown is estimated city range. Actual performance varies by riding conditions and configuration.
      </p>
    </Section>
  );
}
