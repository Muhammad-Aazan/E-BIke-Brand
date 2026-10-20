import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name cannot exceed 100 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens (e.g. electric-motorcycles)'
    )
    .optional(),
  description: z.string().trim().max(1000).optional(),
  image: z.string().url('Category image must be a valid URL').optional(),
  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent Category ObjectId format')
    .optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0, 'Sort order must be non-negative').default(0),
  seoTitle: z.string().trim().max(70, 'SEO title cannot exceed 70 characters').optional(),
  seoDescription: z.string().trim().max(160, 'SEO description cannot exceed 160 characters').optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  includeInactive: z.string().optional().transform((v) => v === 'true'),
  parent: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
