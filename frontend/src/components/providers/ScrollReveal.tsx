'use client';
import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

/** Staggered fade-up for every [data-reveal] element. Respects prefers-reduced-motion. */
export function ScrollReveal() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
        if (!items.length) return;
        gsap.set(items, { y: 28, opacity: 0 });
        ScrollTrigger.batch(items, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true }),
        });
      });
      return () => mm.revert();
    },
    { dependencies: [pathname] },
  );

  return null;
}
