import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Photo } from '@/components/ui/Photo';
import { Section } from '@/components/ui/Section';
import { stories } from '@/content/home';

export function Journal() {
  return (
    <Section bg="bg-ink" inner="flex flex-col gap-8 px-[22px] py-16 lg:gap-12 lg:px-16 lg:py-[104px]">
      <div className="flex flex-col items-start gap-[22px] lg:flex-row lg:items-end lg:justify-between">
        <div data-reveal className="flex flex-col gap-[22px] lg:flex-1">
          <Eyebrow>05 — FROM THE JOURNAL</Eyebrow>
          <h2 className="font-display text-[38px] font-normal leading-[1.08] text-fg lg:text-[64px]">A life in motion.</h2>
        </div>
        <Button href="#" variant="secondary">All stories</Button>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-6">
        {stories.map((s) => (
          <a key={s.title} href="#" data-reveal className="group flex min-w-0 flex-col gap-5 lg:flex-1">
            <div className="relative h-[240px] w-full overflow-hidden lg:h-[300px]">
              <Photo src={s.src} mobileSrc={s.mobileSrc} alt={s.title} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            </div>
            <p className="font-mono text-[10px] leading-[1.5] text-muted">{s.meta}</p>
            <div className="flex w-full items-start justify-between">
              <p className="font-display text-[26px] leading-[normal] text-fg">{s.title}</p>
              <span aria-hidden className="font-body text-[22px] leading-[normal] text-lime transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
            </div>
            <p className="font-body text-[12px] leading-[1.7] text-muted">{s.text}</p>
          </a>
        ))}
      </div>
    </Section>
  );
}
