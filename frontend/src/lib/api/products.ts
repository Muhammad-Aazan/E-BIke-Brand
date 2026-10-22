import { api } from './client';
import { endpoints } from './endpoints';
import { seedMotorcycles } from '@/data/seed';
import type { Category, Paginated, Product } from './types';

export type ProductQuery = {
  category?: string;
  productType?: string;
  q?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  minPrice?: number;
  maxPrice?: number;
  minRange?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
};

export function formatProduct(p: any): Product {
  const rangeSpec = Array.isArray(p.specifications)
    ? p.specifications.find((s: any) => s.key === 'range')
    : undefined;
  const powerSpec = Array.isArray(p.specifications)
    ? p.specifications.find((s: any) => s.key === 'motor_power' || s.key === 'power')
    : undefined;

  const isAccessoryOrPart = p.productType === 'accessory' || p.productType === 'part' || p.category?.slug === 'ev-accessories';

  const defaultImage = isAccessoryOrPart
    ? '/images/products/fast-charger.png'
    : '/images/home/sovereign-r-d.png';

  const images = Array.isArray(p.images) && p.images.length
    ? p.images
    : [defaultImage];

  return {
    id: p._id || p.id,
    slug: p.slug,
    name: p.name,
    category: typeof p.category === 'object' ? p.category.slug : p.category || (isAccessoryOrPart ? 'accessories' : 'motorcycles'),
    description: p.description,
    price: p.basePrice !== undefined ? p.basePrice / 100 : p.price || 0,
    currency: p.currency || 'PKR',
    images,
    imagesMobile: Array.isArray(p.imagesMobile) && p.imagesMobile.length ? p.imagesMobile : images,
    tagline: p.shortDescription || p.tagline || (isAccessoryOrPart ? 'GENUINE ATELIER ACCESSORY' : 'THE ELECTRIC FLEET'),
    year: p.year || 2026,
    rangeMi: rangeSpec?.value ? parseInt(rangeSpec.value, 10) : (isAccessoryOrPart ? undefined : p.rangeMi || 200),
    powerKw: powerSpec?.value ? parseInt(powerSpec.value, 10) : (isAccessoryOrPart ? undefined : p.powerKw || 90),
    featured: p.isFeatured ?? p.featured ?? false,
    published: p.isActive ?? p.published ?? true,
    productType: p.productType || (isAccessoryOrPart ? 'accessory' : 'motorcycle'),
  };
}

/** Accepts either `Product[]` or `{ products: [...] }` or `{ items, total, page, pages }` */
const toPage = (r: any): Paginated<Product> => {
  if (Array.isArray(r)) return { items: r.map(formatProduct), total: r.length, page: 1, pages: 1 };
  if (r && Array.isArray(r.products)) {
    return {
      items: r.products.map(formatProduct),
      total: r.meta?.total || r.products.length,
      page: r.meta?.page || 1,
      pages: r.meta?.totalPages || 1,
    };
  }
  if (r && Array.isArray(r.items)) {
    return { ...r, items: r.items.map(formatProduct) };
  }
  return { items: [], total: 0, page: 1, pages: 1 };
};

export const getProducts = async (query: ProductQuery = {}) =>
  toPage(await api<any>(endpoints.products.list, { query, revalidate: 0 }));

export const getProduct = async (slug: string): Promise<Product | null> => {
  const data = await api<any>(endpoints.products.bySlug(slug), { revalidate: 0 });
  if (data?.product) return formatProduct(data.product);
  if (data?.id || data?._id) return formatProduct(data);
  return null;
};

export const getCategories = () => api<Category[]>(endpoints.products.categories, { revalidate: 300 });

export async function getFeaturedMotorcycles(limit = 3): Promise<Product[]> {
  try {
    const { items } = await getProducts({ productType: 'motorcycle', featured: true, limit });
    if (items && items.length) return items.slice(0, limit);
  } catch {
    /* fallback to seed */
  }
  return seedMotorcycles.slice(0, limit);
}

export async function getAllMotorcycles(): Promise<Product[]> {
  try {
    const { items } = await getProducts({ productType: 'motorcycle', limit: 100 });
    if (items && items.length) return items;
  } catch {
    /* fallback to seed */
  }
  return seedMotorcycles;
}

export async function getAllAccessories(): Promise<Product[]> {
  try {
    const { items } = await getProducts({ productType: 'accessory', limit: 100 });
    if (items && items.length) return items;
  } catch {
    /* fallback */
  }
  return [];
}

export async function getAllProducts(type?: string): Promise<Product[]> {
  try {
    const query: ProductQuery = { limit: 100 };
    if (type && type !== 'all') {
      query.productType = type;
    }
    const { items } = await getProducts(query);
    if (items && items.length) return items;
  } catch {
    /* fallback */
  }
  return seedMotorcycles;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const item = await getProduct(slug);
    if (item && item.id) return item;
  } catch {
    /* fallback to seed */
  }
  return seedMotorcycles.find((p) => p.slug === slug) ?? null;
}
