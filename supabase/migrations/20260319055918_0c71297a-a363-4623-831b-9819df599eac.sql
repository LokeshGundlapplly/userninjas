
-- Fix 1: Restrict testers from self-approving submissions
DROP POLICY IF EXISTS "Testers can update their own submissions" ON public.test_submissions;

CREATE POLICY "Testers can update their own submissions"
ON public.test_submissions FOR UPDATE
USING (auth.uid() = tester_id)
WITH CHECK (
  auth.uid() = tester_id
  AND status IN ('in_progress', 'submitted')
  AND reviewed_at IS NULL
  AND rating IS NULL
);

-- Fix 2: Scope recruiter storage access to only their own tests' attachments
DROP POLICY IF EXISTS "Recruiters can view attachments for their tests" ON storage.objects;

CREATE POLICY "Recruiters can view attachments for their tests"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'submission-attachments'
  AND EXISTS (
    SELECT 1
    FROM public.test_submissions ts
    JOIN public.tests t ON t.id = ts.test_id
    WHERE t.recruiter_id = auth.uid()
      AND (storage.foldername(name))[2] = ts.id::text
  )
);
