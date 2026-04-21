-- Add authentication provider tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'email',
ADD COLUMN IF NOT EXISTS linkedin_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS google_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS company_email boolean DEFAULT false;

-- Create index for verification tracking
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_verified ON public.profiles(linkedin_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_google_verified ON public.profiles(google_verified);
