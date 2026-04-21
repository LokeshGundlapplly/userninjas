-- Create login_otps table for OTP-based login verification
CREATE TABLE public.login_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_login_otps_email_otp ON public.login_otps (email, otp);
CREATE INDEX idx_login_otps_expires_at ON public.login_otps (expires_at);

-- Enable RLS
ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage OTPs (for edge functions)
CREATE POLICY "Service role can manage OTPs"
  ON public.login_otps
  FOR ALL
  USING (true)
  WITH CHECK (true);
