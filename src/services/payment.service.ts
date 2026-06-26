import { supabase } from '@/integrations/supabase/client';

const API_BASE = '/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export const paymentService = {
  async createOrder(planOrAmount: 'per_test' | 'monthly' | 'yearly' | number) {
    const headers = await getAuthHeaders();
    const payload = typeof planOrAmount === 'number'
      ? { amount: planOrAmount }
      : { planName: planOrAmount };

    const response = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initiate payment transaction');
    }

    return response.json();
  },

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/payment/verify-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify transaction signature');
    }

    return response.json();
  },

  async getPaymentHistory() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/payment/history`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch payment log details');
    }

    const res = await response.json();
    return res.data || [];
  },

  async getSubscription() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/subscription`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch subscription details');
    }

    const res = await response.json();
    return res.data;
  },

  async cancelSubscription(cancelAtPeriodEnd = true) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/subscription/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to alter subscription renewal status');
    }

    return response.json();
  },

  async renewSubscription(planName: 'per_test' | 'monthly' | 'yearly') {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/subscription/renew`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process manual renewal');
    }

    return response.json();
  },
  
  async getAllPaymentsAdmin() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/payment/all`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to load all payments');
    }

    const res = await response.json();
    return res.data || [];
  },
  
  async getAllSubscriptionsAdmin() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/subscription/all`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to load all subscriptions');
    }

    const res = await response.json();
    return res.data || [];
  },

  async refundPaymentAdmin(paymentId: string, amount?: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/payment/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentId, amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process refund');
    }

    return response.json();
  }
};
