import { z } from 'zod';

export const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
});

export const renewSubscriptionSchema = z.object({
  planName: z.enum(['per_test', 'monthly', 'yearly']),
});
