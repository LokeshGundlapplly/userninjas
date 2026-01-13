-- Create storage bucket for submission attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('submission-attachments', 'submission-attachments', true);

-- Allow authenticated testers to upload files to their own folder
CREATE POLICY "Testers can upload submission attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submission-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow testers to view their own attachments
CREATE POLICY "Testers can view their own attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow recruiters to view attachments for submissions to their tests
CREATE POLICY "Recruiters can view submission attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-attachments'
);

-- Allow testers to delete their own attachments
CREATE POLICY "Testers can delete their own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'submission-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add attachments column to test_submissions
ALTER TABLE public.test_submissions
ADD COLUMN attachments text[] DEFAULT '{}';