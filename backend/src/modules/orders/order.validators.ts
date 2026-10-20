import { z } from 'zod';

export const trackOrderSchema = z.object({
  email: z.string().trim().email().toLowerCase().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3).max(300).optional(),
});

export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
