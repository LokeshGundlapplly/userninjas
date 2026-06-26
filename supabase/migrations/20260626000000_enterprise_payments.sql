-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  study_limit INTEGER NOT NULL DEFAULT 2,
  features JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert default subscription plans if they don't exist
INSERT INTO public.subscription_plans (plan_name, price, currency, billing_cycle, study_limit, features, status)
VALUES 
  ('free', 0.00, 'INR', 'monthly', 2, '["2 studies max", "Basic reporting"]'::jsonb, 'active'),
  ('per_test', 999.00, 'INR', 'one_time', 1, '["1 custom test", "Up to 50 invites", "Valid 30 days"]'::jsonb, 'active'),
  ('monthly', 2999.00, 'INR', 'monthly', 5, '["Max 5 active tests", "Up to 200 invites / month", "Standard screeners", "Basic report", "AI Interviews (Max 3)", "AI Reports", "Premium Dashboard"]'::jsonb, 'active'),
  ('yearly', 30590.00, 'INR', 'yearly', 99999, '["Unlimited active tests", "Up to 3000 invites / year", "Advanced analytics & CSV", "Priority support", "Unlimited AI Interviews", "Unlimited AI Reports"]'::jsonb, 'active')
ON CONFLICT (plan_name) DO NOTHING;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'created',
  plan_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Update profiles table with required columns and default/fallback values
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';

-- Update existing profiles to sync data
UPDATE public.profiles p
SET 
  name = COALESCE(name, full_name, ''),
  role = COALESCE(role, (SELECT role::text FROM public.user_roles ur WHERE ur.user_id = p.user_id LIMIT 1), 'tester'),
  subscription_plan = COALESCE(subscription_plan, plan_type, 'free');

-- Update payments table with new integration columns
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100) UNIQUE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS captured BOOLEAN DEFAULT FALSE;

-- Update subscriptions table with new integration columns
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Update existing subscriptions
UPDATE public.subscriptions
SET 
  plan_name = COALESCE(plan_name, plan_type::text, 'free'),
  status = COALESCE(status, CASE WHEN is_valid = true THEN 'active' ELSE 'expired' END),
  expiry_date = COALESCE(expiry_date, end_date);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(100) UNIQUE NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Triggers for syncing legacy/new columns automatically

-- Sync profiles columns (full_name <=> name, plan_type <=> subscription_plan, subscription_end <=> subscription_end)
CREATE OR REPLACE FUNCTION public.sync_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync full_name and name
  IF NEW.full_name IS DISTINCT FROM OLD.full_name AND NEW.name IS NOT DISTINCT FROM OLD.name THEN
    NEW.name := NEW.full_name;
  ELSIF NEW.name IS DISTINCT FROM OLD.name AND NEW.full_name IS NOT DISTINCT FROM OLD.full_name THEN
    NEW.full_name := NEW.name;
  END IF;

  -- Sync plan_type and subscription_plan
  IF NEW.plan_type IS DISTINCT FROM OLD.plan_type AND NEW.subscription_plan IS NOT DISTINCT FROM OLD.subscription_plan THEN
    NEW.subscription_plan := NEW.plan_type;
  ELSIF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan AND NEW.plan_type IS NOT DISTINCT FROM OLD.plan_type THEN
    NEW.plan_type := NEW.subscription_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_profile_columns ON public.profiles;
CREATE TRIGGER tr_sync_profile_columns
  BEFORE INSERT OR UPDATE OF full_name, name, plan_type, subscription_plan ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_columns();

-- Sync subscriptions columns (plan_type <=> plan_name, end_date <=> expiry_date)
CREATE OR REPLACE FUNCTION public.sync_subscription_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync plan_type and plan_name
  IF NEW.plan_type::text IS DISTINCT FROM OLD.plan_type::text AND NEW.plan_name IS NOT DISTINCT FROM OLD.plan_name THEN
    NEW.plan_name := NEW.plan_type::text;
  ELSIF NEW.plan_name IS DISTINCT FROM OLD.plan_name AND NEW.plan_type::text IS NOT DISTINCT FROM OLD.plan_type::text THEN
    BEGIN
      NEW.plan_type := NEW.plan_name::public.plan_type_enum;
    EXCEPTION WHEN OTHERS THEN
      -- If invalid enum, keep as is
    END;
  END IF;

  -- Sync end_date and expiry_date
  IF NEW.end_date IS DISTINCT FROM OLD.end_date AND NEW.expiry_date IS NOT DISTINCT FROM OLD.expiry_date THEN
    NEW.expiry_date := NEW.end_date;
  ELSIF NEW.expiry_date IS DISTINCT FROM OLD.expiry_date AND NEW.end_date IS NOT DISTINCT FROM OLD.end_date THEN
    NEW.end_date := NEW.expiry_date;
  END IF;

  -- Sync is_valid based on status
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'active' THEN
      NEW.is_valid := true;
    ELSE
      NEW.is_valid := false;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_subscription_columns ON public.subscriptions;
CREATE TRIGGER tr_sync_subscription_columns
  BEFORE INSERT OR UPDATE OF plan_type, plan_name, end_date, expiry_date, status ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_subscription_columns();


-- Row Level Security (RLS) Configuration

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- subscription_plans policies (anyone can read active plans, admins manage)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- orders policies (users can view/insert their own, admins manage)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- webhook_logs policies (only admins can access)
DROP POLICY IF EXISTS "Admins can access webhook logs" ON public.webhook_logs;
CREATE POLICY "Admins can access webhook logs" ON public.webhook_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );


-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON public.webhook_logs(event_id);
