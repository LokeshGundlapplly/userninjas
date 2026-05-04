-- Add attachments column to public.profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT '{}';

-- Create storage bucket for profile attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-attachments', 'profile-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for profile-attachments bucket
-- Allow anyone to view profile attachments
CREATE POLICY "Anyone can view profile attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-attachments');

-- Allow authenticated users to upload their own attachments
CREATE POLICY "Users can upload their own profile attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own attachments
CREATE POLICY "Users can delete their own profile attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
