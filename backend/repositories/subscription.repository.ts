import { supabaseAdmin } from '../config/database';
import { logger } from '../utils/logger';

export class SubscriptionRepository {
  async getSubscriptionByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to query subscription:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async getPlanByName(planName: string) {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('plan_name', planName)
      .maybeSingle();

    if (error) {
      logger.error('Failed to fetch plan metadata:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async upsertSubscription(sub: {
    user_id: string;
    plan_name: string;
    status: string;
    start_date: string;
    expiry_date: string;
    renewal_date?: string;
    cancel_at_period_end: boolean;
  }) {
    // Check if subscription exists
    const existing = await this.getSubscriptionByUserId(sub.user_id);

    const dataToSave = {
      user_id: sub.user_id,
      plan_name: sub.plan_name,
      status: sub.status,
      start_date: sub.start_date,
      expiry_date: sub.expiry_date,
      renewal_date: sub.renewal_date || sub.expiry_date,
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update(dataToSave)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update subscription:', error);
        throw new Error(`DB Error: ${error.message}`);
      }
      return data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          ...dataToSave,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to insert subscription:', error);
        throw new Error(`DB Error: ${error.message}`);
      }
      return data;
    }
  }

  async cancelSubscriptionAtPeriodEnd(userId: string, cancelAtPeriodEnd: boolean = true) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to flag subscription cancellation:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async updateSubscriptionStatus(userId: string, status: string) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update subscription status:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }
  
  async getAllSubscriptions() {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, profiles(email, full_name, name)')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to query all subscriptions for admin:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data || [];
  }
}
