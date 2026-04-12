-- Make handle_new_user trigger resilient to missing/invalid role metadata
-- If role is missing, default to 'tester' instead of crashing the entire signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _role_enum app_role;
BEGIN
  -- Insert profile (always safe — nullable columns)
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Safely extract and validate role from metadata
  _role := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'role'), ''), 'tester');
  
  BEGIN
    _role_enum := _role::app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    _role_enum := 'tester'::app_role;
  END;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role_enum);
  
  RETURN NEW;
END;
$$;
