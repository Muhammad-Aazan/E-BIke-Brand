export type Category = { id: string; slug: string; name: string };

export type ProductVariant = { id?: string; name: string; color?: string; sku?: string; stock?: number; price?: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  /** Optional portrait/mobile crops (Figma uses different crops on mobile). */
  imagesMobile?: string[];
  variants?: ProductVariant[];
  specifications?: Record<string, string | number>;
  inventory?: number;
  featured?: boolean;
  published?: boolean;
  createdAt?: string;
  // Presentation fields used by the Figma cards (map them from your product model)
  tagline?: string;
  year?: number;
  rangeMi?: number;
  powerKw?: number;
  productType?: 'motorcycle' | 'scooter' | 'accessory' | 'part' | string;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pages: number };

export type CartLine = {
  id: string; // cart item id (server) or `${productId}:${variant}` (guest)
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  variant?: string;
  qty: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';
  addresses?: any[];
};

export type Address = {
  id?: string; fullName: string; phone?: string; line1: string; line2?: string;
  city: string; state?: string; postalCode?: string; country: string;
};

export type OrderItem = { productId: string; name: string; price: number; qty: number; variant?: string; image?: string };

export type Order = {
  id: string; items: OrderItem[]; shippingAddress: Address;
  subtotal: number; shipping: number; discount: number; total: number; currency: string;
  paymentStatus: string; fulfillmentStatus: string; trackingNumber?: string; createdAt: string;
};
