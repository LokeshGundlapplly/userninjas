
-- Add 'admin' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- Add new columns to tests table for enhanced test creation
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS test_type text DEFAULT 'unmoderated',
  ADD COLUMN IF NOT EXISTS target_audience jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prototype_url text,
  ADD COLUMN IF NOT EXISTS screener_questions jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS device_targeting text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS browser_targeting text[] DEFAULT '{}';

-- Test tasks table (step-by-step tasks within a test)
CREATE TABLE IF NOT EXISTS public.test_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.test_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can manage tasks for their tests"
  ON public.test_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM tests WHERE tests.id = test_tasks.test_id AND tests.recruiter_id = auth.uid()));

CREATE POLICY "Anyone can view tasks for active tests"
  ON public.test_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM tests WHERE tests.id = test_tasks.test_id AND tests.status = 'active'));

-- Test questions table (MCQ + open-ended)
CREATE TABLE IF NOT EXISTS public.test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES public.test_tasks(id) ON DELETE SET NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'open_text',
  options jsonb DEFAULT '[]',
  required boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can manage questions for their tests"
  ON public.test_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM tests WHERE tests.id = test_questions.test_id AND tests.recruiter_id = auth.uid()));

CREATE POLICY "Anyone can view questions for active tests"
  ON public.test_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM tests WHERE tests.id = test_questions.test_id AND tests.status = 'active'));

-- Question answers from testers
CREATE TABLE IF NOT EXISTS public.question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.test_submissions(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES public.test_questions(id) ON DELETE CASCADE NOT NULL,
  answer_text text,
  selected_option integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testers can insert their own answers"
  ON public.question_answers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM test_submissions WHERE test_submissions.id = question_answers.submission_id AND test_submissions.tester_id = auth.uid()));

CREATE POLICY "Testers can view their own answers"
  ON public.question_answers FOR SELECT
  USING (EXISTS (SELECT 1 FROM test_submissions WHERE test_submissions.id = question_answers.submission_id AND test_submissions.tester_id = auth.uid()));

CREATE POLICY "Recruiters can view answers for their tests"
  ON public.question_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_submissions ts
    JOIN tests t ON t.id = ts.test_id
    WHERE ts.id = question_answers.submission_id AND t.recruiter_id = auth.uid()
  ));

-- Surveys module
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can manage their surveys"
  ON public.surveys FOR ALL
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Active surveys visible to authenticated"
  ON public.surveys FOR SELECT TO authenticated
  USING (status = 'active');

CREATE TABLE IF NOT EXISTS public.survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'open_text',
  options jsonb DEFAULT '[]',
  required boolean DEFAULT true,
  logic_branch jsonb DEFAULT null,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can manage survey questions"
  ON public.survey_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM surveys WHERE surveys.id = survey_questions.survey_id AND surveys.recruiter_id = auth.uid()));

CREATE POLICY "Authenticated can view active survey questions"
  ON public.survey_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM surveys WHERE surveys.id = survey_questions.survey_id AND surveys.status = 'active'));

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  respondent_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Respondents can insert their response"
  ON public.survey_responses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = respondent_id);

CREATE POLICY "Respondents can view own responses"
  ON public.survey_responses FOR SELECT
  USING (auth.uid() = respondent_id);

CREATE POLICY "Recruiters can view responses for their surveys"
  ON public.survey_responses FOR SELECT
  USING (EXISTS (SELECT 1 FROM surveys WHERE surveys.id = survey_responses.survey_id AND surveys.recruiter_id = auth.uid()));

-- Enhanced tester profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS devices text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio text;

-- Add recording_url to test_submissions
ALTER TABLE public.test_submissions
  ADD COLUMN IF NOT EXISTS recording_url text;
