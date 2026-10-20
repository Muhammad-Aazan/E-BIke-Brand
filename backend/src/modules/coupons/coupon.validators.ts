import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(30, 'Coupon code cannot exceed 30 characters')
    .regex(
      /^[A-Z0-9_-]{3,30}$/,
      'Coupon code must be uppercase letters, numbers, or dashes (e.g. EVEEFIRST)'
    ),
  description: z.string().trim().max(200, 'Description cannot exceed 200 characters').optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z
    .number()
    .int('Discount value must be an integer')
    .min(1, 'Discount value must be at least 1'),
  minimumOrderValue: z
    .number()
    .int('Minimum order value must be an integer (in paisa)')
    .min(0, 'Minimum order value cannot be negative')
    .default(0),
  maximumDiscountAmount: z.number().int().min(0).optional(),
  usageLimit: z.number().int().min(0, 'Usage limit cannot be negative').default(0),
  userUsageLimit: z.number().int().min(0, 'User usage limit cannot be negative').default(1),
  applicableProducts: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ObjectId')).default([]),
  applicableCategories: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ObjectId')).default([]),
  startsAt: z.string().datetime().or(z.date()),
  expiresAt: z.string().datetime().or(z.date()).optional(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponQuerySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, 'Invalid coupon code format (must be 3-30 letters/numbers)'),
  subtotal: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 0)),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
