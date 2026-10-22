import Link from 'next/link';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { NewsletterForm } from './NewsletterForm';
import { brand } from '@/config/brand';

const groups = [
  { title: 'EXPLORE', links: [['Motorcycles', '/products'], ['Sovereign R', '/products/sovereign-r'], ['Vector S', '/products/vector-s'], ['Nomad X', '/products/nomad-x']] },
  { title: brand.upper, links: [['Our story', '/about'], ['Contact', '/contact'], ['Test rides', '/contact'], ['Ownership', '/about']] },
  { title: 'FOLLOW', links: [['Instagram', '#'], ['Vimeo', '#'], ['LinkedIn', '#'], ['Journal', '#']] },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-ink">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-11 overflow-hidden px-[22px] pb-7 pt-14 lg:gap-16 lg:px-16 lg:pt-[72px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="flex w-full flex-col gap-5 lg:w-[470px] lg:shrink">
            <Eyebrow>THE INNER CIRCLE</Eyebrow>
            <p className="font-display text-[32px] leading-[1.08] text-fg lg:text-[38px]">
              <span className="block">Good things are</span>
              <span className="block">on the horizon.</span>
            </p>
            <NewsletterForm />
          </div>

          <nav aria-label="Footer" className="flex items-start justify-between lg:w-[510px] lg:justify-start lg:gap-12 xl:gap-20">
            {groups.map(({ title, links }) => (
              <div key={title} className="flex flex-col gap-[19px]">
                <p className="font-mono text-[10px] leading-[1.5] text-muted">{title}</p>
                {links.map(([label, href]) => (
                  <Link key={label} href={href} className="text-[12px] text-fg transition-colors duration-300 hover:text-lime">{label}</Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <p aria-hidden className="w-full select-none whitespace-nowrap font-display text-[17.4vw] font-medium leading-none text-fg lg:text-[min(17vw,245px)]">
          {brand.upper}
        </p>

        <div className="flex flex-col gap-5 font-mono text-[10px] lg:flex-row lg:items-start lg:justify-between">
          <p className="leading-[1.5] text-muted">© 2026 {brand.upper} {brand.descriptor} · {brand.tagline.toUpperCase()}</p>
          <div className="flex gap-6 font-body leading-[normal]">
            <Link href="#" className="text-dim hover:text-fg">Privacy</Link>
            <Link href="#" className="text-dim hover:text-fg">Terms</Link>
            <span className="text-fg">United States / USD ↗</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
