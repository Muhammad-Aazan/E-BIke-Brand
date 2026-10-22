import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Zap, Gauge, BatteryCharging, ShieldCheck } from 'lucide-react';
import { Photo } from '@/components/ui/Photo';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { getAllProducts, getProductBySlug } from '@/lib/api/products';
import { formatPrice } from '@/lib/format';
import { brand } from '@/config/brand';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const specsList = product.specifications ? Object.entries(product.specifications) : [];

  return (
    <Section bg="bg-ink" inner="flex flex-col gap-12 px-[22px] py-10 lg:gap-16 lg:px-16 lg:py-16">
      {/* Back link */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 font-mono text-[11px] text-muted transition-colors hover:text-lime"
        >
          <ArrowLeft className="size-3.5" />
          <span>BACK TO ALL MOTORCYCLES</span>
        </Link>
      </div>

      {/* Main product overview */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Product Image */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="relative min-h-[340px] w-full overflow-hidden bg-surface sm:min-h-[460px] lg:h-[560px]">
            <Photo
              src={product.images[0]}
              mobileSrc={product.imagesMobile?.[0]}
              alt={product.name}
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </div>
          <div className="flex items-center justify-between border-b border-line pb-3 font-mono text-[10px] text-muted">
            <span>MODEL YEAR {product.year}</span>
            <span>{brand.upper} ATELIER EDITION</span>
          </div>
        </div>

        {/* Right Column: Title, pricing & actions */}
        <div className="flex flex-col justify-between gap-8 lg:col-span-5">
          <div className="flex flex-col gap-5">
            <Eyebrow>{product.tagline}</Eyebrow>
            <h1 className="font-display text-[42px] leading-[1.05] text-fg lg:text-[58px]">
              {product.name}
            </h1>
            <p className="font-mono text-[22px] text-lime">
              {formatPrice(product.price, product.currency)}
            </p>
            <p className="font-body text-[15px] leading-[1.7] text-muted">
              {product.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 border-y border-line py-5">
            {product.rangeMi && (
              <div>
                <p className="font-display text-[26px] text-fg">{product.rangeMi} <span className="text-[14px] font-normal text-muted">MI</span></p>
                <p className="font-mono text-[10px] text-muted">ESTIMATED RANGE</p>
              </div>
            )}
            {product.powerKw && (
              <div>
                <p className="font-display text-[26px] text-fg">{product.powerKw} <span className="text-[14px] font-normal text-muted">KW</span></p>
                <p className="font-mono text-[10px] text-muted">PEAK MOTOR POWER</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <AddToCartButton product={product} />
            <Button href={`/contact?model=${product.slug}`} variant="secondary">
              Book Test Ride
            </Button>
          </div>

          {/* Guarantee bullet points */}
          <div className="flex flex-col gap-2 font-mono text-[10px] text-muted">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-lime" /> Complimentary white-glove home delivery
            </span>
            <span className="flex items-center gap-2">
              <BatteryCharging className="size-3.5 text-lime" /> 5-Year Unlimited Battery & Powertrain Warranty
            </span>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {specsList.length > 0 && (
        <div className="mt-8 border-t border-line pt-12">
          <Eyebrow>TECHNICAL SPECIFICATIONS</Eyebrow>
          <h2 className="mb-8 mt-2 font-display text-[28px] text-fg lg:text-[36px]">
            Engineered to the millimeter.
          </h2>

          <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {specsList.map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1 bg-surface p-5">
                <span className="font-mono text-[10px] uppercase text-muted">{key}</span>
                <span className="font-display text-[17px] text-fg">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
