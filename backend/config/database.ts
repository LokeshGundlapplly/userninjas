import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './constants';
import { logger } from '../utils/logger';

const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY2xuemdvdXp5cm9lYmp2Y3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzgxNzQsImV4cCI6MjA5MTUxNDE3NH0.4_-lqvso4fBKd3T_E669dVTAt5e7pKDRZWndFFz5TB4';
const serviceKey = SUPABASE_SERVICE_ROLE_KEY || anonKey; // Fallback to anon in dev environments if service key not provided

if (!SUPABASE_SERVICE_ROLE_KEY) {
  logger.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Admin functions will fall back to Anon key and might run into RLS issues.');
}

export const supabaseAdmin = createClient(SUPABASE_URL, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
