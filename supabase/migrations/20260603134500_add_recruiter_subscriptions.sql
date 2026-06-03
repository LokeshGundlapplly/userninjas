-- Create custom enum types if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type_enum') THEN
    CREATE TYPE public.plan_type_enum AS ENUM ('per_test', 'monthly', 'yearly');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
    CREATE TYPE public.payment_status_enum AS ENUM ('pending', 'success', 'failed');
  END IF;
END $$;

-- Add description column to payments table if it doesn't exist
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS description TEXT;

-- Create subscriptions table linked to auth.users (recruiter/company)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type public.plan_type_enum NOT NULL,
  payment_status public.payment_status_enum NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  tests_created INTEGER NOT NULL DEFAULT 0,
  invites_sent INTEGER NOT NULL DEFAULT 0,
  active_test_limit INTEGER NOT NULL DEFAULT 2,
  invite_limit INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow select and upsert for own subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscription'
  ) THEN
    CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' AND policyname = 'Users can insert/update their own subscription'
  ) THEN
    CREATE POLICY "Users can insert/update their own subscription"
    ON public.subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger function to increment invites_sent count on test_submissions creation
CREATE OR REPLACE FUNCTION public.increment_subscription_invites()
RETURNS TRIGGER AS $$
DECLARE
  v_recruiter_id UUID;
BEGIN
  -- Get recruiter_id from the tests table
  SELECT recruiter_id INTO v_recruiter_id
  FROM public.tests
  WHERE id = NEW.test_id;

  IF v_recruiter_id IS NOT NULL THEN
    -- Increment invites_sent counter in subscriptions table
    UPDATE public.subscriptions
    SET invites_sent = invites_sent + 1,
        updated_at = now()
    WHERE user_id = v_recruiter_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS tr_increment_subscription_invites ON public.test_submissions;

CREATE TRIGGER tr_increment_subscription_invites
  AFTER INSERT ON public.test_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_subscription_invites();
