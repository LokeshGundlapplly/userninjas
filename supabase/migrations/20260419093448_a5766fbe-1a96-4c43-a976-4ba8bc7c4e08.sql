-- Contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  last_name text,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Moderated study time slots
CREATE TABLE IF NOT EXISTS public.study_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'available',
  booked_by uuid,
  booked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_slots_test_id ON public.study_slots(test_id);

ALTER TABLE public.study_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view slots for active tests"
  ON public.study_slots FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tests WHERE tests.id = study_slots.test_id AND tests.status = 'active'));

CREATE POLICY "Recruiters can manage slots for their tests"
  ON public.study_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tests WHERE tests.id = study_slots.test_id AND tests.recruiter_id = auth.uid()));

CREATE POLICY "Authenticated users can book available slots"
  ON public.study_slots FOR UPDATE
  USING (auth.uid() IS NOT NULL AND status = 'available')
  WITH CHECK (auth.uid() IS NOT NULL AND booked_by = auth.uid());