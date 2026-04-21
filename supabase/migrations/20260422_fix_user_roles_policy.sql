-- Fix user_roles RLS policy - allow users to read their own role
-- This fixes the admin redirect issue where users couldn't read their own role from user_roles table

-- Drop the restrictive policy that only allowed admins
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Add two new policies:
-- 1. Users can read their own role
CREATE POLICY "Users can read their own role" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- 2. Admins can read all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (has_role(auth.uid(), 'admin'));
