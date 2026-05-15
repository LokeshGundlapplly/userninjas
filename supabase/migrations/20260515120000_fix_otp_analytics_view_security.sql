-- =============================================================================
-- Fix: otp_verification_analytics view SECURITY DEFINER vulnerability
-- =============================================================================
-- The view was created with implicit SECURITY DEFINER (the default in Postgres
-- pre-15), meaning it ran with the privileges of the creator and could bypass
-- Row Level Security for the querying user.
--
-- Fixes applied:
--  1. Recreate the view with SECURITY INVOKER (requires Postgres >= 15, which
--     Supabase uses). This ensures RLS is enforced for whoever queries the view.
--  2. Revoke SELECT from 'anon' and 'authenticated' roles so the view is only
--     accessible to 'service_role' and 'postgres' (admin-only analytics).
--  3. The underlying login_otps table already has RLS enabled and the correct
--     policies in place (from the previous migration).
-- =============================================================================

-- Step 1: Drop and recreate the view with SECURITY INVOKER
-- This makes the view execute with the RLS context of the querying user,
-- not the view owner. Any anon/authenticated user who somehow queries it will
-- only see rows allowed by the RLS policies on login_otps (i.e., their own email).

DROP VIEW IF EXISTS public.otp_verification_analytics;

CREATE OR REPLACE VIEW public.otp_verification_analytics
WITH (security_invoker = on)
AS
SELECT
  DATE(created_at)                                                            AS date,
  COUNT(*)                                                                    AS total_otps_sent,
  COUNT(CASE WHEN verification_status = 'verified' THEN 1 END)               AS successful_verifications,
  COUNT(CASE WHEN verification_status = 'failed'   THEN 1 END)               AS failed_verifications,
  COUNT(CASE WHEN verification_status = 'pending'  THEN 1 END)               AS pending,
  COUNT(CASE WHEN verification_status = 'expired'  THEN 1 END)               AS expired,
  ROUND(
    100.0
    * COUNT(CASE WHEN verification_status = 'verified' THEN 1 END)
    / NULLIF(COUNT(*), 0),
    2
  )                                                                           AS verification_success_rate
FROM public.login_otps
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Step 2: Lock down view access.
-- Revoke public SELECT grants (PostgREST exposes any relation that anon/authenticated
-- can SELECT). Only service_role (backend/edge functions) should read analytics.

REVOKE SELECT ON public.otp_verification_analytics FROM anon;
REVOKE SELECT ON public.otp_verification_analytics FROM authenticated;

-- Grant only to service_role (used by Supabase Edge Functions / admin tooling).
GRANT SELECT ON public.otp_verification_analytics TO service_role;

-- Step 3: Confirm RLS is still enabled on the source table.
-- (It was already enabled in the prior migration; this is a no-op safety net.)
ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

-- Optional comment for documentation purposes
COMMENT ON VIEW public.otp_verification_analytics IS
  'Admin-only analytics view for OTP verification metrics. '
  'SECURITY INVOKER: RLS on login_otps is enforced for every caller. '
  'Access restricted to service_role only.';
