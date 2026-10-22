'use client';
import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import type { Product } from '@/lib/api/types';

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="inline-flex h-[52px] items-center justify-center gap-3 border border-transparent bg-lime px-8 font-body text-[13px] font-medium text-night transition-colors duration-200 hover:bg-[#e0f48f]"
    >
      {added ? (
        <>
          <Check className="size-4 shrink-0" />
          <span>Added to Cart</span>
        </>
      ) : (
        <>
          <ShoppingBag className="size-4 shrink-0" />
          <span>Reserve / Add to Cart</span>
        </>
      )}
    </button>
  );
}
