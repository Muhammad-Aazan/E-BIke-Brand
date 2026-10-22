/**
 * EVERY backend route the frontend calls lives here.
 * If your backend paths differ, edit this file only.
 * Paths are relative to NEXT_PUBLIC_API_URL (e.g. http://localhost:5000/api/v1).
 */
export const endpoints = {
  auth: {
    register: 'auth/register',
    login: 'auth/login',
    logout: 'auth/logout',
    me: 'auth/me',
  },
  products: {
    list: 'products',
    bySlug: (slug: string) => `products/${encodeURIComponent(slug)}`,
    categories: 'categories',
  },
  cart: {
    get: 'cart',
    items: 'cart/items',
    item: (id: string) => `cart/items/${encodeURIComponent(id)}`,
  },
  checkout: {
    sendOtp: 'checkout/send-otp',
    verifyOtp: 'checkout/verify-otp',
    validate: 'checkout/validate',
    createOrder: 'checkout/create-order',
  },
  payments: {
    status: (orderNumber: string) => `payments/${encodeURIComponent(orderNumber)}/status`,
  },
  orders: {
    list: 'orders',
    byId: (id: string) => `orders/${encodeURIComponent(id)}`,
  },
  contact: 'contact',
  newsletter: 'newsletter',
} as const;
