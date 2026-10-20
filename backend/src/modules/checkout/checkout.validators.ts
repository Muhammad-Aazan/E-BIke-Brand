import { z } from 'zod';
import { addressSchema } from '../users/user.validators';

export const checkoutAddressSchema = addressSchema.omit({ isDefault: true, label: true });

const checkoutItemSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ObjectId format'),
  variantId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Variant ObjectId format')
    .optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity cannot exceed 999'),
});

export const validateCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'At least one item is required to validate checkout'),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, 'Coupon code must be 3-30 uppercase characters, numbers, or hyphens')
    .optional(),
  shippingAddress: checkoutAddressSchema.optional(),
  paymentProvider: z.enum(['stripe', 'cod', 'bank_transfer']).default('stripe'),
});

export const createOrderSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'At least one item is required to create an order'),
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional(),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, 'Coupon code must be 3-30 uppercase characters, numbers, or hyphens')
    .optional(),
  paymentProvider: z.enum(['stripe', 'cod', 'bank_transfer']).default('stripe'),
  customerNotes: z.string().trim().max(500, 'Customer notes cannot exceed 500 characters').optional(),
  guestName: z.string().trim().min(2, 'Guest name must be at least 2 characters').max(100).optional(),
  guestEmail: z.string().trim().email('Please enter a valid guest email address').toLowerCase().optional(),
});

export type ValidateCheckoutInput = z.infer<typeof validateCheckoutSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
