import { z } from 'zod';

const shippingMethodInputSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  description: z.string().trim().optional(),
  price: z.number().int('Price must be an integer in paisa').min(0, 'Price must be non-negative'),
  estimatedDaysMin: z.number().int().min(0),
  estimatedDaysMax: z.number().int().min(0),
  isActive: z.boolean().default(true),
  restrictions: z
    .object({
      maxWeight: z.number().optional(),
      productTypes: z.array(z.string()).optional(),
      requiresPickup: z.boolean().optional(),
    })
    .optional(),
});

export const createShippingZoneSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().optional(),
  countries: z
    .array(
      z
        .string()
        .length(2, 'Country code must be exactly 2 characters')
        .toUpperCase()
        .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters (e.g. PK)')
    )
    .min(1, 'At least one country is required'),
  cities: z.array(z.string().trim()).default([]),
  methods: z.array(shippingMethodInputSchema).min(1, 'At least one shipping method is required'),
  freeShippingThreshold: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateShippingZoneSchema = createShippingZoneSchema.partial();

export const calculateShippingSchema = z.object({
  country: z
    .string()
    .length(2, 'Country code must be exactly 2 characters (e.g. PK)')
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters (e.g. PK)')
    .default('PK'),
  city: z.string().trim().optional(),
  subtotal: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0))
    .or(z.number().int().min(0).default(0)),
});

export type CreateShippingZoneInput = z.infer<typeof createShippingZoneSchema>;
export type UpdateShippingZoneInput = z.infer<typeof updateShippingZoneSchema>;
export type CalculateShippingInput = z.infer<typeof calculateShippingSchema>;
