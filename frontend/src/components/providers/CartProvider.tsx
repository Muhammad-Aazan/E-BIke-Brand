'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine } from '@/lib/api/types';

/**
 * Guest cart in localStorage. Header count + cart/checkout pages read from here.
 * TODO(api): when the user is signed in, mirror these actions to
 * addCartItem / updateCartItem / removeCartItem (src/lib/api/cart.ts) and merge
 * the guest cart after login.
 */
type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, 'id' | 'qty'>, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const KEY = 'cart:v1';
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback<CartCtx['add']>((line, qty = 1) => {
    const id = `${line.productId}:${line.variant ?? ''}`;
    setLines((prev) => {
      const hit = prev.find((l) => l.id === id);
      return hit ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l)) : [...prev, { ...line, id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l))));
  }, []);

  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.price * l.qty, 0),
      add, setQty, remove, clear,
    }),
    [lines, add, setQty, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
