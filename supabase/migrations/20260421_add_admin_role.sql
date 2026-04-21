-- Add 'admin' role to app_role enum - SAFE MIGRATION
-- Handles both clean state and partially applied state

-- Step 1: Drop functions if they exist (safe with IF EXISTS)
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;

-- Step 2: Drop policies if they exist (safe with IF EXISTS)  
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can view all tests" ON public.tests CASCADE;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.test_submissions CASCADE;
DROP POLICY IF EXISTS "Admins can view all insights" ON public.submission_insights CASCADE;
DROP POLICY IF EXISTS "Only service role can insert insights" ON public.submission_insights CASCADE;
DROP POLICY IF EXISTS "Only service role can update insights" ON public.submission_insights CASCADE;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations CASCADE;
DROP POLICY IF EXISTS "Admins can update all conversations" ON public.chat_conversations CASCADE;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages CASCADE;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.chat_messages CASCADE;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions CASCADE;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions CASCADE;
DROP POLICY IF EXISTS "Admins can view all ai_interview_sessions" ON public.ai_interview_sessions CASCADE;
DROP POLICY IF EXISTS "Users can view their own ai_interview_sessions" ON public.ai_interview_sessions CASCADE;
DROP POLICY IF EXISTS "Admins can update any ai_interview_sessions" ON public.ai_interview_sessions CASCADE;
DROP POLICY IF EXISTS "Users can update their own ai_interview_sessions" ON public.ai_interview_sessions CASCADE;
DROP POLICY IF EXISTS "Admins can delete any ai_interview_sessions" ON public.ai_interview_sessions CASCADE;
DROP POLICY IF EXISTS "Users can delete their own ai_interview_sessions" ON public.ai_interview_sessions CASCADE;

-- Step 3: Check if app_role_new already exists (from partial application) and drop it
DROP TYPE IF EXISTS public.app_role_new CASCADE;

-- Step 4: Create new enum type with admin role
CREATE TYPE public.app_role_new AS ENUM ('tester', 'recruiter', 'admin');

-- Step 5: Migrate data to new enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role_new USING role::text::public.app_role_new;

-- Step 6: Drop old enum and rename new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 7: Recreate helper functions
CREATE FUNCTION public.has_role(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  )
$$;

CREATE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.user_roles
  WHERE user_roles.user_id = $1
  LIMIT 1
$$;

-- Step 8: Recreate handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _role_enum app_role;
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  _role := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'role'), ''), 'tester');
  
  BEGIN
    _role_enum := _role::app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    _role_enum := 'tester'::app_role;
  END;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role_enum)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Step 9: Recreate core policies (without ai_interview_sessions which has schema issues)
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all tests" ON public.tests
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all submissions" ON public.test_submissions
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all insights" ON public.submission_insights
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only service role can insert insights" ON public.submission_insights
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update insights" ON public.submission_insights
FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view all conversations" ON public.chat_conversations
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all conversations" ON public.chat_conversations
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all messages" ON public.chat_messages
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert messages" ON public.chat_messages
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
FOR UPDATE USING (has_role(auth.uid(), 'admin'));
