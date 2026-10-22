'use client';
import { gsap, useGSAP } from '@/lib/gsap';

/** Entrance timings taken from the Figma prototype (0.9s ease-out, staggered 0 / .16 / .24s). */
export function HeroMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ease = 'power2.out';
      gsap.from('[data-hero="image"]', { opacity: 0.88, duration: 0.9, ease });
      gsap.from('[data-hero="headline"]', { y: 12, duration: 0.9, ease });
      gsap.from('[data-hero="actions"]', { y: 12, duration: 0.9, delay: 0.16, ease });
      gsap.from('[data-hero="marker"]', { y: 12, duration: 0.9, delay: 0.24, ease });
    });
    return () => mm.revert();
  }, []);
  return null;
}
