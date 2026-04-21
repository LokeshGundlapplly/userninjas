ALTER TABLE public.test_submissions 
  ADD COLUMN IF NOT EXISTS transcript text,
  ADD COLUMN IF NOT EXISTS transcript_summary text;