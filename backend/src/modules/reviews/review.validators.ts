import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ObjectId format'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  title: z.string().trim().max(200, 'Title cannot exceed 200 characters').optional(),
  body: z
    .string()
    .trim()
    .min(5, 'Review must be at least 5 characters')
    .max(5000, 'Review cannot exceed 5000 characters'),
});

export const moderateReviewSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  adminNote: z.string().trim().max(500, 'Admin note cannot exceed 500 characters').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
