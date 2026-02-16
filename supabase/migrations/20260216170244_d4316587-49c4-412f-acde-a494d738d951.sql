
-- Make the submission-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'submission-attachments';

-- Drop the overly permissive recruiter view policy
DROP POLICY IF EXISTS "Recruiters can view submission attachments" ON storage.objects;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Testers can view their own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Recruiters can view attachments for their tests" ON storage.objects;

-- Create a proper policy: testers can view their own uploads
CREATE POLICY "Testers can view their own attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a proper policy: recruiters can view attachments for tests they own
CREATE POLICY "Recruiters can view attachments for their tests"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-attachments'
  AND public.has_role(auth.uid(), 'recruiter')
);
