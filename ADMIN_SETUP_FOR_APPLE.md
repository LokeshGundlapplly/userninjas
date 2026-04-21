# 🔐 Set apple.mypic@gmail.com as Admin

## ✅ Issue Fixed!

**Problem**: Admin redirect wasn't working due to RLS policy blocking users from reading their own role.

**Solution**: Deployed migration `20260422_fix_user_roles_policy.sql` which allows users to read their own role while maintaining admin-only access to other users' roles.

**Status**: ✓ Fixed and deployed to production

---

## Quick Setup (3 Steps)

### Step 1: Go to Supabase Dashboard
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Find User ID

Paste this query and click **Run**:

```sql
SELECT user_id, email FROM profiles WHERE email = 'apple.mypic@gmail.com';
```

**Copy the `user_id`** (the UUID in the result)

### Step 3: Set as Admin

Click **New Query** again and paste this (replace `PASTE_USER_ID_HERE` with the UUID from Step 2):

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('PASTE_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Click **Run** ✓

### Step 4: Verify

Click **New Query** and paste:

```sql
SELECT ur.user_id, ur.role, p.email 
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE p.email = 'apple.mypic@gmail.com';
```

Should show: `role = 'admin'` ✓

---

## What Happens Next

1. ✅ User is set as admin in database
2. ✅ RLS policies allow admin to read their own role
3. User logs in with `apple.mypic@gmail.com`
4. Auto-redirects to `/admin` 
5. ✅ Admin Control Center loads with all 7 tabs

---

## Complete Steps to Verify

**ALREADY DONE FOR YOU:**
- ✓ Fixed RLS policy (Migration 20260422 deployed)
- ✓ admin role added to database enum
- ✓ Code deployed to production

**NOW YOU NEED TO:**
1. Run the three SQL queries below in Supabase Dashboard
2. Then logout and login again with apple.mypic@gmail.com
3. You should see `/admin` auto-redirect

**Status**: Ready for final admin assignment ✓
