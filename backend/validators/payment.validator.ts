import { z } from 'zod';

export const createOrderSchema = z.object({
  planName: z.enum(['per_test', 'monthly', 'yearly']).optional(),
  amount: z.number().positive().optional(),
}).refine((data) => data.planName || data.amount, {
  message: 'Either planName or amount must be specified',
  path: ['planName'],
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
});

export const refundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().positive('Refund amount must be positive').optional(),
});
