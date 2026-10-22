import { Section } from '@/components/ui/Section';
import { quote } from '@/content/home';

export function Quote() {
  return (
    <Section bg="bg-paper" inner="flex flex-col gap-8 px-[22px] py-16 lg:gap-12 lg:px-16 lg:py-[104px]">
      <div className="flex w-full items-start justify-between whitespace-nowrap text-night">
        <p className="font-mono text-[10px] leading-[1.5]">THE RIDER&apos;S PERSPECTIVE</p>
        <p aria-label="Five stars" className="font-body text-[13px]">★★★★★</p>
      </div>
      <blockquote data-reveal className="font-display text-[32px] leading-[1.23] text-night lg:text-[58px]">
        <p>
          {quote.lines[0]} <br className="hidden lg:block" />
          {quote.lines[1]}
        </p>
        <p>{quote.last}</p>
      </blockquote>
      <div className="flex items-center gap-[18px]">
        <span className="h-px w-9 bg-night" aria-hidden />
        <p className="font-mono text-[10px] leading-[1.5] text-night">{quote.by}</p>
      </div>
    </Section>
  );
}
