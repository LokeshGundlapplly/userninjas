
-- Admin can view all user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all tests (including non-active)
CREATE POLICY "Admins can view all tests"
  ON public.tests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.test_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
