import { metrics } from '@/content/home';

export function Metrics() {
  return (
    <section aria-label="Performance at a glance" className="w-full border-y border-line bg-surface">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-6 px-[22px] py-8 lg:flex lg:justify-between lg:gap-0 lg:px-16 lg:py-11">
        {metrics.map((m) => (
          <div key={m.unit} data-reveal className="flex flex-col gap-3 lg:max-w-[270px] lg:flex-1">
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <p className="font-display text-[38px] text-fg lg:text-[48px]">{m.value}</p>
              <p className="font-mono text-[10px] text-lime">{m.unit}</p>
            </div>
            <p className="font-body text-[11px] text-muted">{m.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
