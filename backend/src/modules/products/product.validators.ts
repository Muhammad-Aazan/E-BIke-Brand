import { z } from 'zod';

const specificationSchema = z.object({
  key: z.string().trim().min(1, 'Specification key cannot be empty'),
  label: z.string().trim().min(1, 'Specification label cannot be empty'),
  value: z.string().trim().min(1, 'Specification value cannot be empty'),
  unit: z.string().trim().optional(),
  group: z.string().trim().default('General'),
});

const colorVariantSchema = z.object({
  name: z.string().trim().min(1, 'Variant name cannot be empty'),
  colorHex: z
    .string()
    .trim()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code (e.g. #00d4aa or #fff)'),
  images: z.array(z.string().url('Images must be valid URLs')).default([]),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, 'SKU must be uppercase alphanumeric with hyphens (e.g. EVE-M125-PRO-BLK)'),
  additionalPrice: z.number().int('Price must be an integer (in paisa)').min(0, 'Additional price must be non-negative').default(0),
  inventory: z.number().int('Inventory must be an integer').min(0, 'Inventory cannot be negative').default(0),
  isActive: z.boolean().default(true),
});

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name cannot exceed 200 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens (e.g. evee-pro-125)')
    .optional(),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'SKU must be at least 2 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, 'Base SKU must be uppercase alphanumeric with hyphens (e.g. EVE-M125-PRO)'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().trim().max(500, 'Short description cannot exceed 500 characters').optional(),
  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ObjectId format'),
  brand: z.string().trim().default('EVee'),
  productType: z.enum(['motorcycle', 'scooter', 'accessory', 'part']),
  basePrice: z
    .number()
    .int('Price must be an integer in currency subunits (paisa)')
    .min(0, 'Price must be non-negative'),
  compareAtPrice: z.number().int('Compare-at price must be an integer in paisa').min(0).optional(),
  currency: z.string().length(3).toUpperCase().default('PKR'),
  images: z.array(z.string().url('Image must be a valid URL')).default([]),
  specifications: z.array(specificationSchema).default([]),
  colorVariants: z.array(colorVariantSchema).default([]),
  inventory: z.number().int().min(0, 'Inventory cannot be negative').default(0),
  inventoryPolicy: z.enum(['track', 'preorder', 'unlimited']).default('track'),
  weight: z.number().positive('Weight must be positive').optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().trim()).default([]),
  seoTitle: z.string().trim().max(70, 'SEO title cannot exceed 70 characters').optional(),
  seoDescription: z.string().trim().max(160, 'SEO description cannot exceed 160 characters').optional(),
  seoKeywords: z.array(z.string().trim()).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional().transform((v) => Math.max(1, parseInt(v || '1', 10))),
  limit: z.string().optional().transform((v) => Math.min(50, Math.max(1, parseInt(v || '12', 10)))),
  category: z.string().optional(),
  productType: z.enum(['motorcycle', 'scooter', 'accessory', 'part']).optional(),
  minPrice: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  maxPrice: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  color: z.string().optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'popular', 'featured', 'rating'])
    .optional()
    .default('newest'),
  search: z.string().trim().optional(),
  featured: z.string().optional().transform((v) => v === 'true'),
  includeInactive: z.string().optional().transform((v) => v === 'true'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
