
DROP POLICY "Service role can insert insights" ON public.submission_insights;

CREATE POLICY "Only service role can insert insights"
ON public.submission_insights FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only service role can update insights"
ON public.submission_insights FOR UPDATE
USING (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));
