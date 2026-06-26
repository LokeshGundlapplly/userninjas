export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_Sx5YIPbX0SGPU4';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'qJYzHPmsnBGdnL1tNRW3Lclm';
export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://jpclnzgouzyroebjvcqp.supabase.co';
// service role bypasses RLS policies for critical updates like transaction state
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.userninjas.in';

export interface PlanDetails {
  name: string;
  priceINR: number;
  days: number;
  testLimit: number;
  inviteLimit: number;
}

export const PLANS: Record<string, PlanDetails> = {
  free: {
    name: 'Free Plan',
    priceINR: 0,
    days: 0,
    testLimit: 2,
    inviteLimit: 25,
  },
  per_test: {
    name: 'Pay-Per-Test (A La Carte Plan)',
    priceINR: 999,
    days: 30,
    testLimit: 1,
    inviteLimit: 50,
  },
  monthly: {
    name: 'Monthly Subscription (Standard Tier)',
    priceINR: 2999,
    days: 30,
    testLimit: 5,
    inviteLimit: 200,
  },
  yearly: {
    name: 'Yearly Subscription (Enterprise/Premium Tier)',
    priceINR: 30590,
    days: 365,
    testLimit: 99999,
    inviteLimit: 3000,
  },
};
