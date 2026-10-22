import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Photo } from '@/components/ui/Photo';
import { Section } from '@/components/ui/Section';
import { brand } from '@/config/brand';

export function Philosophy() {
  return (
    <Section bg="bg-paper" inner="flex flex-col lg:flex-row lg:items-stretch">
      <div className="relative h-[400px] w-full overflow-hidden lg:h-[700px] lg:w-1/2 lg:shrink-0">
        <Photo src="/images/home/freedom-d.png" mobileSrc="/images/home/freedom-m.png" alt="Rider on a coastal road" sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
      <div className="flex w-full flex-col items-start justify-center gap-7 p-8 lg:flex-1 lg:p-[72px]">
        <Eyebrow tone="dark" data-reveal>02 — THE {brand.upper} PHILOSOPHY</Eyebrow>
        <h2 data-reveal className="font-display text-[43px] leading-[1.08] text-night lg:text-[62px]">
          <span className="block">Nothing between</span>
          <span className="block">you and the road.</span>
        </h2>
        <p data-reveal className="font-body text-[15px] leading-[1.7] text-moss">
          No engine noise. No inherited rules. Just immediate torque, considered design, and the feeling that made you ride in the first place. We build electric motorcycles with a human soul.
        </p>
        <Button href="/about" variant="dark">Our story</Button>
      </div>
    </Section>
  );
}
