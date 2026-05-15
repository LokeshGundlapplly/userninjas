-- Add subscription columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_limit INTEGER DEFAULT 2;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gateway VARCHAR(20) NOT NULL, -- 'stripe', 'razorpay', etc.
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'successful', 'failed', 'pending'
  plan_type VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create screener_questions table for dynamic forms
CREATE TABLE public.screener_questions (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
   question_type VARCHAR(50) NOT NULL, -- 'text', 'mcq', 'checkbox', 'rating', 'yes_no'
   question_text TEXT NOT NULL,
   options JSONB, -- For mcq, checkbox options
   conditional_logic JSONB, -- e.g., {"ifAnswer": "No", "action": "reject_participant"}
   sort_order INTEGER NOT NULL DEFAULT 0,
   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
   updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screener_questions ENABLE ROW LEVEL SECURITY;

-- Payments RLS
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Screener Questions RLS
CREATE POLICY "Anyone can view active screener questions"
ON public.screener_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = screener_questions.test_id 
    AND tests.status = 'active'
  )
);

CREATE POLICY "Recruiters can view their screener questions"
ON public.screener_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = screener_questions.test_id 
    AND tests.recruiter_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can insert screener questions for their tests"
ON public.screener_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = screener_questions.test_id 
    AND tests.recruiter_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can update their screener questions"
ON public.screener_questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = screener_questions.test_id 
    AND tests.recruiter_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can delete their screener questions"
ON public.screener_questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = screener_questions.test_id 
    AND tests.recruiter_id = auth.uid()
  )
);

-- Trigger to update updated_at for screener_questions
CREATE TRIGGER update_screener_questions_updated_at
  BEFORE UPDATE ON public.screener_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
