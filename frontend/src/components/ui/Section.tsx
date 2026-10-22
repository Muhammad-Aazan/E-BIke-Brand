import { cn } from '@/lib/cn';

/** Full-bleed background, content capped at the Figma frame width (1440px). */
export function Section({
  bg, className, inner, children, ...rest
}: { bg?: string; inner?: string } & Omit<React.ComponentProps<'section'>, 'children'> & { children: React.ReactNode }) {
  return (
    <section className={cn('w-full', bg, className)} {...rest}>
      <div className={cn('mx-auto w-full max-w-[1440px]', inner)}>{children}</div>
    </section>
  );
}
