import { cn } from '@/lib/cn';

const tones = { lime: 'text-lime', dark: 'text-night', muted: 'text-muted' } as const;

export function Eyebrow({
  tone = 'lime', className, ...rest
}: { tone?: keyof typeof tones } & React.ComponentProps<'p'>) {
  return <p className={cn('whitespace-nowrap font-mono text-[10px] leading-[1.5]', tones[tone], className)} {...rest} />;
}
