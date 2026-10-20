import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending_payment',
    'confirmed',
    'processing',
    'ready_to_ship',
    'shipped',
    'delivered',
    'cancelled',
    'partially_refunded',
    'refunded',
  ]),
  note: z.string().trim().max(500, 'Status note cannot exceed 500 characters').optional(),
});

export const addShipmentDetailsSchema = z.object({
  carrier: z
    .string()
    .trim()
    .min(2, 'Carrier name must be at least 2 characters')
    .max(100),
  trackingNumber: z
    .string()
    .trim()
    .min(2, 'Tracking number must be at least 2 characters')
    .max(100),
  estimatedDelivery: z.string().datetime().or(z.date()).optional(),
  notifyCustomer: z.boolean().default(true),
});

export const adjustStockSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ObjectId format'),
  variantId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Variant ObjectId format')
    .optional(),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, 'Invalid SKU format'),
  quantityDelta: z
    .number()
    .int('Quantity delta must be an integer'),
  movementType: z.enum(['restock', 'adjustment', 'return', 'damage']),
  note: z.string().trim().max(300, 'Note cannot exceed 300 characters').optional(),
});

export const updateCustomerStatusSchema = z.object({
  accountStatus: z.enum(['active', 'suspended']),
  reason: z.string().trim().max(300, 'Reason cannot exceed 300 characters').optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddShipmentDetailsInput = z.infer<typeof addShipmentDetailsSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;
