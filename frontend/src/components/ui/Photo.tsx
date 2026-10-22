import Image, { getImageProps } from 'next/image';
import { cn } from '@/lib/cn';

type Props = {
  src: string;
  /** Different crop for < 1024px (Figma uses separate mobile crops). */
  mobileSrc?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** `fill` image with optional art-direction. Parent must be `relative` with a height. */
export function Photo({ src, mobileSrc, alt = '', priority, sizes = '100vw', className }: Props) {
  const cls = cn('object-cover', className);
  const isExternal = typeof src === 'string' && src.startsWith('http');

  if (!mobileSrc) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={isExternal}
        className={cls}
      />
    );
  }

  const common = { alt, fill: true, sizes, priority, unoptimized: isExternal } as const;
  const { props: desktop } = getImageProps({ ...common, src });
  const { props: { srcSet: mobileSet, ...img } } = getImageProps({ ...common, src: mobileSrc });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktop.srcSet} />
      <source srcSet={mobileSet} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...img} alt={alt} className={cls} />
    </picture>
  );
}
