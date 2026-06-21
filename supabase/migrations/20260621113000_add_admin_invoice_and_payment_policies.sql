-- Add Admin policies for payments, subscriptions, and profiles update

-- ===== PAYMENTS TABLE =====
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can insert all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete all payments" ON public.payments;

-- Create unified policies
CREATE POLICY "Users and admins can view payments" ON public.payments
FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Users and admins can insert payments" ON public.payments
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update payments" ON public.payments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete payments" ON public.payments
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);


-- ===== SUBSCRIPTIONS TABLE =====
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert/update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

-- Create unified policies
CREATE POLICY "Users and admins can view subscriptions" ON public.subscriptions
FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Users and admins can manage subscriptions" ON public.subscriptions
FOR ALL USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
) WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);


-- ===== PROFILES TABLE =====
-- Drop existing update policy if any admin ones were created
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create admin update policy (users already have their own update policy)
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
