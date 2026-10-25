import { Hero } from '@/components/home/Hero';
import { Metrics } from '@/components/home/Metrics';
import { Collection } from '@/components/home/Collection';
import { Philosophy } from '@/components/home/Philosophy';
import { Engineering } from '@/components/home/Engineering';
import { Charging } from '@/components/home/Charging';
import { Quote } from '@/components/home/Quote';
import { Journal } from '@/components/home/Journal';
import { Invitation } from '@/components/home/Invitation';
import { getFeaturedMotorcycles } from '@/lib/api/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const products = await getFeaturedMotorcycles(3);
  return (
    <>
      <Hero />
      <Metrics />
      <Collection products={products} />
      <Philosophy />
      <Engineering />
      <Charging />
      <Quote />
      <Journal />
      <Invitation />
    </>
  );
}
