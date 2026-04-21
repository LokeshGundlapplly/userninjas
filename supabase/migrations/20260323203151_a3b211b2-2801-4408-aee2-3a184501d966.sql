
CREATE TABLE public.submission_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.test_submissions(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  summary text NOT NULL,
  pain_points text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  sentiment text NOT NULL DEFAULT 'neutral',
  key_findings text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(submission_id)
);

ALTER TABLE public.submission_insights ENABLE ROW LEVEL SECURITY;

-- Recruiters can view insights for their tests
CREATE POLICY "Recruiters can view insights for their tests"
ON public.submission_insights FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tests
  WHERE tests.id = submission_insights.test_id
  AND tests.recruiter_id = auth.uid()
));

-- Service role inserts (edge function)
CREATE POLICY "Service role can insert insights"
ON public.submission_insights FOR INSERT
WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view all insights"
ON public.submission_insights FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
