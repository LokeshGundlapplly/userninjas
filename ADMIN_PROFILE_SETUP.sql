-- Create Admin Profile Setup
-- Run after logging in with apple.mypic@gmail.com

-- Step 1: Delete any tester role for apple.mypic@gmail.com
DELETE FROM user_roles
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'apple.mypic@gmail.com')
AND role = 'tester';

-- Step 2: Create admin role for apple.mypic@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM profiles
WHERE email = 'apple.mypic@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify admin profile is set up
SELECT p.user_id, p.email, p.full_name, ur.role, count(ur.role) as role_count
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'apple.mypic@gmail.com'
GROUP BY p.user_id, p.email, p.full_name, ur.role;
