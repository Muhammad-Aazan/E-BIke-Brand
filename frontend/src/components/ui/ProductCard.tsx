import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Photo } from './Photo';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/api/types';

export function ProductCard({ product }: { product: Product }) {
  const {
    name,
    slug,
    tagline,
    year,
    price,
    currency,
    rangeMi,
    powerKw,
    images,
    imagesMobile,
    productType,
  } = product;

  let highlights = '';
  if (rangeMi || powerKw) {
    highlights = [rangeMi && `${rangeMi} mi RANGE`, powerKw && `${powerKw} kW`].filter(Boolean).join(' · ');
  } else if (productType === 'accessory') {
    highlights = 'GENUINE ACCESSORY · FACTORY FIT';
  } else if (productType === 'part') {
    highlights = 'OEM REPLACEMENT PART · IN STOCK';
  } else if (productType === 'scooter') {
    highlights = 'CITY COMMUTER · ZERO EMISSION';
  } else {
    highlights = 'ELECTRIC MOTORCYCLE · IN STOCK';
  }

  const mainImage = Array.isArray(images) && images.length > 0 && images[0]
    ? images[0]
    : productType === 'accessory' || productType === 'part'
    ? '/images/products/fast-charger.png'
    : '/images/home/sovereign-r-d.png';

  return (
    <Link href={`/products/${slug}`} data-reveal className="group flex min-w-0 flex-col gap-6 lg:flex-1">
      <div className="flex w-full flex-col overflow-hidden bg-surface border border-line/60">
        <div className="flex items-start justify-between px-[22px] pt-[22px] font-mono text-[10px]">
          <p className="leading-[1.5] text-muted truncate max-w-[200px]">{tagline}</p>
          <p className="text-lime uppercase font-semibold">{productType || 'Vehicle'}</p>
        </div>
        <div className="relative h-[230px] w-full overflow-hidden lg:h-[270px]">
          <Photo
            src={mainImage}
            mobileSrc={imagesMobile?.[0] || mainImage}
            alt={name}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-between text-fg gap-3">
        <p className="font-display text-[26px] truncate">{name}</p>
        <p className="font-mono text-[14px] text-lime font-bold shrink-0">{formatPrice(price, currency)}</p>
      </div>
      <div className="flex w-full items-start justify-between border-b border-line pb-[22px]">
        <p className="font-mono text-[10px] leading-[1.5] text-muted">{highlights}</p>
        <ArrowUpRight
          className="size-5 text-lime transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    </Link>
  );
}
