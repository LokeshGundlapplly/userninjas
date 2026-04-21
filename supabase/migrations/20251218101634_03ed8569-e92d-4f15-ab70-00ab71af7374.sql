-- Create tests table (created by recruiters)
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  max_testers INTEGER DEFAULT 100,
  current_testers INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_submissions table
CREATE TABLE public.test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  tester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (test_id, tester_id)
);

-- Create earnings table
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_id UUID REFERENCES public.test_submissions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Tests RLS policies
CREATE POLICY "Anyone can view active tests"
ON public.tests FOR SELECT
USING (status = 'active');

CREATE POLICY "Recruiters can manage their own tests"
ON public.tests FOR ALL
USING (auth.uid() = recruiter_id);

-- Test submissions RLS policies
CREATE POLICY "Testers can view their own submissions"
ON public.test_submissions FOR SELECT
USING (auth.uid() = tester_id);

CREATE POLICY "Testers can create submissions"
ON public.test_submissions FOR INSERT
WITH CHECK (auth.uid() = tester_id);

CREATE POLICY "Testers can update their own submissions"
ON public.test_submissions FOR UPDATE
USING (auth.uid() = tester_id);

CREATE POLICY "Recruiters can view submissions for their tests"
ON public.test_submissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tests 
  WHERE tests.id = test_submissions.test_id 
  AND tests.recruiter_id = auth.uid()
));

CREATE POLICY "Recruiters can update submissions for their tests"
ON public.test_submissions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.tests 
  WHERE tests.id = test_submissions.test_id 
  AND tests.recruiter_id = auth.uid()
));

-- Earnings RLS policies
CREATE POLICY "Testers can view their own earnings"
ON public.earnings FOR SELECT
USING (auth.uid() = tester_id);

-- Triggers for updated_at
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample tests for demo
INSERT INTO public.tests (recruiter_id, title, description, requirements, reward_amount, estimated_duration, category, status)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Mobile App Usability Test',
  'Test our new e-commerce mobile app and provide feedback on the checkout flow.',
  'iOS or Android device, 18+ years old',
  25.00,
  30,
  'Mobile',
  'active'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.tests (recruiter_id, title, description, requirements, reward_amount, estimated_duration, category, status)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Website Navigation Study',
  'Help us improve our website by testing the navigation and search functionality.',
  'Desktop browser, Good internet connection',
  15.00,
  20,
  'Web',
  'active'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.tests (recruiter_id, title, description, requirements, reward_amount, estimated_duration, category, status)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'SaaS Dashboard Feedback',
  'Review our analytics dashboard and share your thoughts on data visualization.',
  'Experience with analytics tools preferred',
  35.00,
  45,
  'SaaS',
  'active'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);