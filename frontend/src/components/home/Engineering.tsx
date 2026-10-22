import { Eyebrow } from '@/components/ui/Eyebrow';
import { Photo } from '@/components/ui/Photo';
import { Section } from '@/components/ui/Section';
import { principles } from '@/content/home';

export function Engineering() {
  return (
    <Section bg="bg-ink" inner="flex flex-col gap-8 px-[22px] py-16 lg:gap-12 lg:px-16 lg:py-[104px]">
      <Eyebrow data-reveal>03 — ENGINEERING, WITHOUT EXCESS</Eyebrow>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <h2 data-reveal className="font-display text-[38px] font-normal leading-[1.08] text-fg lg:flex-1 lg:text-[64px]">
          <span className="block">Every detail.</span>
          <span className="block">A reason to exist.</span>
        </h2>
        <p data-reveal className="w-full font-body text-[15px] leading-[1.7] text-muted lg:w-[350px] lg:shrink-0">
          Purposeful materials. Intuitive technology. Nothing added for the sake of it.
        </p>
      </div>

      <div data-reveal className="relative h-[320px] w-full overflow-hidden lg:h-[440px]">
        <Photo src="/images/home/powertrain-d.png" mobileSrc="/images/home/powertrain-m.png" alt="Machined powertrain detail" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {principles.map((p) => (
          <div key={p.n} data-reveal className="flex min-w-0 flex-col gap-4 lg:flex-1">
            <div className="h-px w-full bg-line" />
            <p className="font-mono text-[10px] leading-[1.5] text-lime">{p.n}</p>
            <p className="font-display text-[23px] text-fg">{p.title}</p>
            <p className="font-body text-[12px] leading-[1.7] text-muted">{p.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
