import { api } from './client';
import { endpoints } from './endpoints';
import type { CartLine } from './types';

export const getCart = () => api<{ items: CartLine[] }>(endpoints.cart.get);
export const addCartItem = (productId: string, qty = 1, variant?: string) =>
  api<{ items: CartLine[] }>(endpoints.cart.items, { method: 'POST', body: { productId, qty, variant } });
export const updateCartItem = (id: string, qty: number) =>
  api<{ items: CartLine[] }>(endpoints.cart.item(id), { method: 'PATCH', body: { qty } });
export const removeCartItem = (id: string) =>
  api<{ items: CartLine[] }>(endpoints.cart.item(id), { method: 'DELETE' });
