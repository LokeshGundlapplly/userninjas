import { supabaseAdmin } from '../config/database';
import { logger } from '../utils/logger';

export class ProfileRepository {
  async getProfileByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to select profile details:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    if (data && !data.role) {
      const { data: roleRecord } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleRecord) {
        data.role = roleRecord.role;
      }
    }

    return data;
  }

  async updateProfileSubscription(userId: string, planName: string, studyLimit: number, expiryDate: string | null) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_plan: planName,
        plan_type: planName, // Legacy column sync
        subscription_status: 'active',
        study_limit: studyLimit,
        subscription_end: expiryDate, // Legacy column sync
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update profile subscription details:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async deactivateProfileSubscription(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_plan: 'free',
        plan_type: 'free',
        subscription_status: 'inactive',
        study_limit: 2,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to deactivate profile subscription details:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }

  async updateWalletBalance(userId: string, balance: number) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        wallet_balance: balance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to save wallet balance:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return data;
  }
}
