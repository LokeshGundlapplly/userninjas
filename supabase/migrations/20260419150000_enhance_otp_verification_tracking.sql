-- Enhance login_otps table with verification tracking
-- This migration adds status tracking and attempt logging for OTP verification

-- Add new columns to login_otps table
ALTER TABLE public.login_otps 
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_attempts INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_error TEXT;

-- Add comment to explain status values
COMMENT ON COLUMN public.login_otps.verification_status IS 
'Status of OTP verification: pending, verified, expired, failed';

COMMENT ON COLUMN public.login_otps.verification_attempts IS 
'Number of verification attempts for this OTP';

-- Create index for efficient queries on verification status
CREATE INDEX IF NOT EXISTS idx_login_otps_status 
ON public.login_otps(email, verification_status);

-- Create index for querying failed verifications
CREATE INDEX IF NOT EXISTS idx_login_otps_failed 
ON public.login_otps(email, verification_status, created_at DESC)
WHERE verification_status = 'failed';

-- Create view for OTP verification analytics
CREATE OR REPLACE VIEW public.otp_verification_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_otps_sent,
  COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as successful_verifications,
  COUNT(CASE WHEN verification_status = 'failed' THEN 1 END) as failed_verifications,
  COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN verification_status = 'expired' THEN 1 END) as expired,
  ROUND(100.0 * COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) / 
        NULLIF(COUNT(*), 0), 2) as verification_success_rate
FROM public.login_otps
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create function to update OTP status
CREATE OR REPLACE FUNCTION public.update_otp_verification_status(
  p_email TEXT,
  p_otp TEXT,
  p_status TEXT,
  p_error TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.login_otps
  SET 
    verification_status = p_status,
    verification_attempts = verification_attempts + 1,
    last_attempt_at = NOW(),
    verified_at = CASE WHEN p_status = 'verified' THEN NOW() ELSE verified_at END,
    verification_error = p_error
  WHERE email = LOWER(TRIM(p_email))
    AND otp = p_otp;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if OTP is valid
CREATE OR REPLACE FUNCTION public.is_valid_otp(
  p_email TEXT,
  p_otp TEXT
) RETURNS TABLE(
  is_valid BOOLEAN,
  expires_soon BOOLEAN,
  attempts INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (verification_status = 'pending' AND expires_at > NOW())::BOOLEAN,
    (expires_at < NOW() + INTERVAL '2 minutes' AND expires_at > NOW())::BOOLEAN,
    verification_attempts
  FROM public.login_otps
  WHERE email = LOWER(TRIM(p_email))
    AND otp = p_otp
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_otp_verification_status(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_valid_otp(TEXT, TEXT) TO service_role;

-- Create RLS policies for analytics view
ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

-- Allow service role to read/update OTP records
CREATE POLICY "Service role manages OTPs"
  ON public.login_otps
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow anon/auth users to see their own OTP verification status (limited)
CREATE POLICY "Users can check their OTP status"
  ON public.login_otps
  FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1)
  );
