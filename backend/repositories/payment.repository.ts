import { supabaseAdmin } from '../config/database';
import { logger } from '../utils/logger';

export class PaymentRepository {
  async createOrder(userId: string, razorpayOrderId: string, amount: number, currency: string = 'INR', planName?: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        razorpay_order_id: razorpayOrderId,
        amount,
        currency,
        plan_name: planName || null,
        status: 'created'
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create order record:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async getOrderByRazorpayId(razorpayOrderId: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to query order by Razorpay ID:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update order status:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async createPaymentRecord(payment: {
    user_id: string;
    order_id: string | null;
    gateway: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
    currency: string;
    status: string;
    payment_method?: string;
    captured: boolean;
    description?: string;
  }) {
    // Check if duplicate payment id exists
    const { data: existing } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('razorpay_payment_id', payment.razorpay_payment_id)
      .maybeSingle();

    if (existing) {
      logger.warn('Duplicate payment record detected:', payment.razorpay_payment_id);
      return existing;
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: payment.user_id,
        order_id: payment.order_id,
        gateway: payment.gateway,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        payment_method: payment.payment_method || 'unknown',
        captured: payment.captured,
        description: payment.description || ''
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to insert payment record:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async getPaymentsByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to retrieve payment history:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data || [];
  }
  
  async getAllPayments() {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, profiles(email, full_name, name)')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to retrieve all payments for admin:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data || [];
  }

  async updatePaymentStatus(paymentId: string, status: string, captured: boolean) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({ status, captured })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update payment status:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }
}
