-- Skip if the user doesn't exist in this project (safe for fresh deploys)
INSERT INTO public.user_roles (user_id, role)
SELECT '84ac693c-22ed-44a2-82d1-2e7f9008f427', 'admin'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = '84ac693c-22ed-44a2-82d1-2e7f9008f427')
ON CONFLICT (user_id, role) DO NOTHING;