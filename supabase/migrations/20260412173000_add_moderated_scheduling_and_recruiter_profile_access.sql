-- Moderated study scheduling support + recruiter access to tester profile details

-- Ensure tests can store a fallback static meeting link
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS meeting_link text;

-- Slots created by recruiter for moderated sessions
CREATE TABLE IF NOT EXISTS public.study_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'available',
  booked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  booked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT study_slots_status_check CHECK (status IN ('available', 'booked', 'cancelled', 'completed')),
  CONSTRAINT study_slots_time_check CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_study_slots_test_id ON public.study_slots(test_id);
CREATE INDEX IF NOT EXISTS idx_study_slots_status_start_time ON public.study_slots(status, start_time);
CREATE INDEX IF NOT EXISTS idx_study_slots_booked_by ON public.study_slots(booked_by);

ALTER TABLE public.study_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can manage study slots for own tests"
  ON public.study_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.tests t
      WHERE t.id = study_slots.test_id
        AND t.recruiter_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tests t
      WHERE t.id = study_slots.test_id
        AND t.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view available upcoming study slots"
  ON public.study_slots
  FOR SELECT TO authenticated
  USING (
    status = 'available'
    AND start_time > now()
    AND EXISTS (
      SELECT 1
      FROM public.tests t
      WHERE t.id = study_slots.test_id
        AND t.status = 'active'
    )
  );

CREATE POLICY "Testers can book available study slots"
  ON public.study_slots
  FOR UPDATE TO authenticated
  USING (
    status = 'available'
    AND EXISTS (
      SELECT 1
      FROM public.tests t
      WHERE t.id = study_slots.test_id
        AND t.status = 'active'
    )
  )
  WITH CHECK (
    status = 'booked'
    AND booked_by = auth.uid()
    AND booked_at IS NOT NULL
  );

-- Final booked sessions that can hold Zoom details
CREATE TABLE IF NOT EXISTS public.scheduled_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL UNIQUE REFERENCES public.study_slots(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  tester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_url text,
  zoom_meeting_id text,
  zoom_join_url text,
  zoom_password text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scheduled_sessions_status_check CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  CONSTRAINT scheduled_sessions_unique_tester_test UNIQUE (tester_id, test_id)
);

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_tester_id ON public.scheduled_sessions(tester_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_test_id ON public.scheduled_sessions(test_id);

ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testers can view own scheduled sessions"
  ON public.scheduled_sessions
  FOR SELECT TO authenticated
  USING (tester_id = auth.uid());

CREATE POLICY "Testers can create own scheduled sessions"
  ON public.scheduled_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    tester_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.study_slots ss
      WHERE ss.id = slot_id
        AND ss.test_id = test_id
        AND ss.booked_by = auth.uid()
    )
  );

CREATE POLICY "Testers can update own scheduled sessions"
  ON public.scheduled_sessions
  FOR UPDATE TO authenticated
  USING (tester_id = auth.uid())
  WITH CHECK (tester_id = auth.uid());

CREATE POLICY "Recruiters can view sessions for own tests"
  ON public.scheduled_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.tests t
      WHERE t.id = scheduled_sessions.test_id
        AND t.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update sessions for own tests"
  ON public.scheduled_sessions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.tests t
      WHERE t.id = scheduled_sessions.test_id
        AND t.recruiter_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tests t
      WHERE t.id = scheduled_sessions.test_id
        AND t.recruiter_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.enforce_scheduled_session_slot_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  slot_test_id uuid;
BEGIN
  SELECT test_id INTO slot_test_id
  FROM public.study_slots
  WHERE id = NEW.slot_id;

  IF slot_test_id IS NULL THEN
    RAISE EXCEPTION 'Invalid slot_id: %', NEW.slot_id;
  END IF;

  IF NEW.test_id <> slot_test_id THEN
    RAISE EXCEPTION 'scheduled_sessions.test_id must match study_slots.test_id';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_scheduled_session_slot_match_trigger ON public.scheduled_sessions;
CREATE TRIGGER enforce_scheduled_session_slot_match_trigger
  BEFORE INSERT OR UPDATE ON public.scheduled_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_scheduled_session_slot_match();

-- Allow recruiters to see tester profile fields for testers who submitted to their tests
CREATE POLICY "Recruiters can view tester profiles for own tests"
  ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'recruiter'
    )
    AND EXISTS (
      SELECT 1
      FROM public.test_submissions ts
      JOIN public.tests t ON t.id = ts.test_id
      WHERE ts.tester_id = profiles.user_id
        AND t.recruiter_id = auth.uid()
    )
  );
