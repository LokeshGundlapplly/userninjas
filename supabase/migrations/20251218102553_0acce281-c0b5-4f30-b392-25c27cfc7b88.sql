-- Add restrictive policies to prevent unauthorized modifications to earnings
-- Only backend/edge functions with service role should be able to modify earnings

-- Deny all INSERT operations from regular users (system only via service role)
CREATE POLICY "System only can insert earnings" 
ON public.earnings 
FOR INSERT 
WITH CHECK (false);

-- Deny all UPDATE operations from regular users (system only via service role)
CREATE POLICY "System only can update earnings" 
ON public.earnings 
FOR UPDATE 
USING (false);

-- Deny all DELETE operations from regular users (system only via service role)
CREATE POLICY "System only can delete earnings" 
ON public.earnings 
FOR DELETE 
USING (false);