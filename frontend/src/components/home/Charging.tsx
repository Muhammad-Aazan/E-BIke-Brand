import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Photo } from '@/components/ui/Photo';
import { Section } from '@/components/ui/Section';

const highlights = [
  { value: '30 min', label: '20–80% DC CHARGE' },
  { value: '5 years', label: 'BATTERY WARRANTY' },
];

export function Charging() {
  return (
    <Section bg="bg-surface" inner="flex flex-col lg:flex-row lg:items-start">
      <div className="flex w-full flex-col items-start justify-center gap-7 px-[22px] py-16 lg:h-[660px] lg:flex-1 lg:px-16 lg:py-20">
        <Eyebrow data-reveal>04 — LESS WAITING. MORE WANDERING.</Eyebrow>
        <h2 data-reveal className="font-display text-[38px] leading-[1.08] text-fg lg:text-[64px]">
          <span className="block">Recharge.</span>
          <span className="block">Then disappear.</span>
        </h2>
        <p data-reveal className="font-body text-[15px] leading-[1.7] text-muted">
          Plug in at home. Top up on the road. With universal CCS charging and a 30-minute rapid charge, the only thing to plan is your next turn.
        </p>
        <div data-reveal className="flex gap-10 whitespace-nowrap">
          {highlights.map((h) => (
            <div key={h.label} className="flex flex-col gap-[10px]">
              <p className="font-display text-[38px] leading-[normal] text-fg">{h.value}</p>
              <p className="font-mono text-[10px] leading-[1.5] text-muted">{h.label}</p>
            </div>
          ))}
        </div>
        <Button href="/about" variant="secondary">Explore ownership</Button>
      </div>
      <div className="relative h-[360px] w-full lg:h-[660px] lg:w-1/2 lg:shrink-0">
        <Photo src="/images/home/ownership-d.png" mobileSrc="/images/home/ownership-m.png" alt="Electric motorcycle parked outside a modern home" sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
    </Section>
  );
}
