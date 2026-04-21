-- Set apple.mypic@gmail.com as admin
-- This script finds the user and assigns admin role

-- Step 1: Find the user ID
-- Copy the user_id from the result below
SELECT user_id, email FROM profiles WHERE email = 'apple.mypic@gmail.com';

-- Step 2: Set as admin (replace USER_ID with the UUID from Step 1)
-- After finding the user_id above, uncomment and run this query:
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify admin role was set
-- Run this to confirm:
-- SELECT ur.user_id, ur.role, p.email 
-- FROM user_roles ur
-- LEFT JOIN profiles p ON ur.user_id = p.user_id
-- WHERE p.email = 'apple.mypic@gmail.com';
