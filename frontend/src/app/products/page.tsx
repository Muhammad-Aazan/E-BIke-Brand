'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, Sparkles, Filter, X } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ProductCard } from '@/components/ui/ProductCard';
import { Section } from '@/components/ui/Section';
import { getAllProducts } from '@/lib/api/products';
import { brand } from '@/config/brand';
import type { Product } from '@/lib/api/types';

const CATEGORIES = [
  { id: 'all', label: 'All Fleet & Gear' },
  { id: 'motorcycle', label: 'Electric Motorcycles' },
  { id: 'scooter', label: 'Electric Scooters' },
  { id: 'accessory', label: 'Accessories & Equipment' },
  { id: 'part', label: 'Spare Parts' },
] as const;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get('type') || searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>(typeParam);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSelectedType(typeParam);
  }, [typeParam]);

  useEffect(() => {
    setLoading(true);
    getAllProducts()
      .then((items) => {
        setProducts(items);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectTab = (typeId: string) => {
    setSelectedType(typeId);
    if (typeId === 'all') {
      router.push('/products');
    } else {
      router.push(`/products?type=${typeId}`);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Type matching
      const pType = (p.productType || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();

      let matchesType = true;
      if (selectedType !== 'all') {
        if (selectedType === 'accessory') {
          matchesType = pType === 'accessory' || pCat.includes('accessor');
        } else if (selectedType === 'motorcycle') {
          matchesType = pType === 'motorcycle' || pCat.includes('motorcycle') || (!pType && !pCat.includes('accessor'));
        } else if (selectedType === 'scooter') {
          matchesType = pType === 'scooter' || pCat.includes('scooter');
        } else if (selectedType === 'part') {
          matchesType = pType === 'part' || pCat.includes('part');
        } else {
          matchesType = pType === selectedType || pCat.includes(selectedType);
        }
      }

      // Search matching
      const searchLower = search.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower)) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchLower));

      return matchesType && matchesSearch;
    });
  }, [products, selectedType, search]);

  // Counts per category for the pills
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const t = (p.productType || 'motorcycle').toLowerCase();
      map[t] = (map[t] || 0) + 1;
      if (t === 'accessory' || (p.category && p.category.includes('accessor'))) {
        map['accessory'] = (map['accessory'] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  return (
    <Section bg="bg-ink" inner="flex flex-col gap-10 px-[22px] py-14 lg:gap-14 lg:px-16 lg:py-20">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Eyebrow>COLLECTION — 2026 FLEET & EQUIPMENT</Eyebrow>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-display text-[42px] leading-[1.08] text-fg lg:text-[68px]">
            <span className="block">Pure electric.</span>
            <span className="block text-lime">Zero compromise.</span>
          </h1>
          <p className="max-w-[440px] font-body text-[15px] leading-[1.7] text-muted">
            Engineered from clean-sheet architecture by {brand.name} {brand.descriptor}. Explore our high-performance motorcycles, commuter scooters, smart chargers, and atelier protective gear.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 border-y border-line py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectTab(cat.id)}
                  className={`px-4 py-2 rounded font-mono text-[12px] uppercase whitespace-nowrap transition-colors border ${
                    active
                      ? 'bg-lime text-night border-lime font-bold shadow-md shadow-lime/10'
                      : 'bg-surface/60 border-line text-muted hover:text-fg hover:border-fg'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fleet, gear, accessories..."
              className="w-full bg-surface border border-line pl-9 pr-8 py-2 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime font-body"
            />
            <Search className="absolute left-3 top-2.5 size-4 text-dim pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-dim hover:text-fg"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Showing Count Indicator */}
        <div className="flex items-center justify-between text-muted font-mono text-[11px] pt-2">
          <span>
            Showing {filteredProducts.length} {selectedType === 'all' ? 'Items Total' : selectedType === 'accessory' ? 'Accessories & Gear' : selectedType === 'part' ? 'Spare Parts' : 'Vehicles'}
          </span>
          {selectedType !== 'all' && (
            <button
              type="button"
              onClick={() => handleSelectTab('all')}
              className="text-lime hover:underline"
            >
              Clear filter (Show All)
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 font-mono text-lime text-[13px]">
          <Loader2 className="size-6 animate-spin" />
          <span>Synchronizing live fleet inventory...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="min-h-[280px] border border-line bg-surface/40 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="font-display text-[22px] text-fg">No Items Found</p>
          <p className="max-w-[420px] text-[13px] text-muted leading-relaxed">
            There are currently no items matching &ldquo;{search || selectedType}&rdquo; in our live catalog.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedType('all'); setSearch(''); }}
            className="px-5 py-2.5 bg-lime text-night font-semibold text-[12px] hover:bg-[#e0f48f] transition-colors"
          >
            View Entire Fleet Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Footer Assurance Banner */}
      <div className="mt-8 border-t border-line pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-[11px] text-muted">
        <p>
          All {brand.name} motorcycles and equipment include factory certification, warranty, and nationwide handover dispatch.
        </p>
        <span className="text-lime whitespace-nowrap">
          Live Factory Stock · Direct Atelier Delivery
        </span>
      </div>
    </Section>
  );
}
