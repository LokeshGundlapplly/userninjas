-- Fix admin data access by simplifying RLS policies
-- Remove has_role() circular reference that's breaking admin access

-- ===== USER_ROLES TABLE =====
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Allow users to read their own role
CREATE POLICY "Users can read their own role" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Allow admins to read all roles (direct check, no function call)
CREATE POLICY "Admins can read all roles" ON public.user_roles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ===== PROFILES TABLE =====
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Users read own profile
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

-- Admins read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ===== TESTS TABLE =====
DROP POLICY IF EXISTS "Recruiters can read own tests" ON public.tests;
DROP POLICY IF EXISTS "Admins can view all tests" ON public.tests;

-- Recruiters read own tests
CREATE POLICY "Recruiters can read own tests" ON public.tests
FOR SELECT USING (recruiter_id = auth.uid());

-- Admins read all tests
CREATE POLICY "Admins can read all tests" ON public.tests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ===== TEST_SUBMISSIONS TABLE =====
DROP POLICY IF EXISTS "Testers can read own submissions" ON public.test_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.test_submissions;

-- Testers read own submissions
CREATE POLICY "Testers can read own submissions" ON public.test_submissions
FOR SELECT USING (tester_id = auth.uid());

-- Admins read all submissions
CREATE POLICY "Admins can read all submissions" ON public.test_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ===== SUBMISSION_INSIGHTS TABLE =====
DROP POLICY IF EXISTS "Only service role can insert insights" ON public.submission_insights;
DROP POLICY IF EXISTS "Only service role can update insights" ON public.submission_insights;
DROP POLICY IF EXISTS "Admins can view all insights" ON public.submission_insights;

-- Service role insert/update insights
CREATE POLICY "Service role can manage insights" ON public.submission_insights
FOR ALL USING (auth.role() = 'service_role');

-- Admins view all insights
CREATE POLICY "Admins can view all insights" ON public.submission_insights
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ===== CHAT_CONVERSATIONS TABLE =====
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can update all conversations" ON public.chat_conversations;

-- Admins view conversations
CREATE POLICY "Admins can view all conversations" ON public.chat_conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Admins update conversations
CREATE POLICY "Admins can update all conversations" ON public.chat_conversations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ===== CHAT_MESSAGES TABLE =====
DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.chat_messages;

-- Admins view messages
CREATE POLICY "Admins can view all messages" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Admins insert messages
CREATE POLICY "Admins can insert messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ===== CONTACT_SUBMISSIONS TABLE =====
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;

-- Admins view contact submissions
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Admins update contact submissions
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
