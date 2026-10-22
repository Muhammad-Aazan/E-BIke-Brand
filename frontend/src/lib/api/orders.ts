import { api } from './client';

export interface ApiOrderItem {
  product: string;
  productName: string;
  sku: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantName?: string;
}

export interface OrderDetail {
  _id: string;
  orderNumber: string;
  items: ApiOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  grandTotal: number;
  currency: string;
  paymentProvider: string;
  paymentStatus: string;
  orderStatus: string;
  customerNotes?: string;
  trackingNumber?: string;
  createdAt: string;
}

export async function getUserOrders(): Promise<OrderDetail[]> {
  try {
    const data = await api<{ orders: OrderDetail[] } | OrderDetail[]>('users/orders');
    return (data as any)?.orders || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

export async function getOrderDetail(orderNumber: string): Promise<OrderDetail | null> {
  try {
    const data = await api<{ order: OrderDetail }>('orders/' + encodeURIComponent(orderNumber));
    return data?.order || (data as any);
  } catch {
    return null;
  }
}

export async function trackOrder(orderNumber: string, email?: string): Promise<any> {
  const data = await api<{ tracking: any }>('orders/track/' + encodeURIComponent(orderNumber), {
    query: email ? { email } : undefined,
  });
  return data?.tracking || data;
}

export async function cancelOrder(orderNumber: string, reason: string): Promise<any> {
  return api('orders/' + encodeURIComponent(orderNumber) + '/cancel', {
    method: 'POST',
    body: { reason },
  });
}
