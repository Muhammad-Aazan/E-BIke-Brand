import { z } from 'zod';
import { phoneRegex, phoneErrorMessage } from '../auth/auth.validators';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().regex(phoneRegex, phoneErrorMessage).optional(),
});

export const addressSchema = z.object({
  label: z.string().trim().default('home'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, phoneErrorMessage),
  addressLine1: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100),
  state: z.string().trim().optional(),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{4,6}$/, 'Postal code must be 4 to 6 numeric digits (e.g. 54000)')
    .optional(),
  country: z
    .string()
    .length(2, 'Country must be a 2-letter ISO code (e.g. PK)')
    .toUpperCase()
    .default('PK'),
  isDefault: z.boolean().default(false),
});

export const addAddressSchema = addressSchema;
export const updateAddressSchema = addressSchema.partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddAddressInput = z.infer<typeof addAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
