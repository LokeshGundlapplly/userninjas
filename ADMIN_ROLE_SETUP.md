# 🔧 Setup Admin Role - Complete Guide

## Problem
- ✗ `/admin` redirect not working
- ✗ `app_role` enum missing 'admin' value
- ✗ User role can't be set to admin

## Solution

### Step 1: Apply Database Migration

Run this migration in **Supabase SQL Editor**:

```sql
-- Add 'admin' role to app_role enum
CREATE TYPE public.app_role_new AS ENUM ('tester', 'recruiter', 'admin');
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role_new USING role::text::public.app_role_new;
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

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
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  _role := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'role'), ''), 'tester');
  
  BEGIN
    _role_enum := _role::app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    _role_enum := 'tester'::app_role;
  END;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role_enum)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;
```

### Step 2: Set Your User Role to Admin

Replace `YOUR_USER_ID` with your actual user ID from `auth.users` table:

```sql
-- Option 1: Update existing role to admin
UPDATE user_roles
SET role = 'admin'
WHERE user_id = 'YOUR_USER_ID';

-- Option 2: If no role exists, insert admin role
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3: How to Find Your User ID

1. Go to **Supabase Studio**
2. Click **Authentication** (left sidebar)
3. Click **Users** tab
4. Find your email address
5. Copy the **User ID** (UUID column)

### Step 4: Verify Admin Role

Run this query to confirm:

```sql
SELECT ur.user_id, ur.role, p.email, p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.role = 'admin';
```

Should return your user with role='admin'

### Step 5: Test Redirect

1. Login to your account
2. Navigate to `https://www.userninjas.in/admin`
3. ✅ Should redirect to Admin Control Center

---

## Why This Was Needed

The `app_role` enum was originally defined as:
```sql
CREATE TYPE public.app_role AS ENUM ('tester', 'recruiter');
```

It was missing the `'admin'` value. PostgreSQL enums are immutable, so we:
1. Created a new enum type with all values ✓
2. Migrated the column to use the new type ✓
3. Dropped the old enum ✓
4. Renamed the new one ✓

---

## If You Get Errors

**Error: "type 'app_role' already exists"**
- The migration was already applied
- Just run Step 2 to set your role

**Error: "user_id not found"**
- Make sure you copied the correct UUID from auth.users table
- Verify the format is a valid UUID

**Error: "role 'admin' not recognized"**
- Migration didn't apply
- Run Step 1 again in SQL Editor

---

## After Setup

Your workflow:
1. ✅ Login at `/auth`
2. ✅ Auto-redirected to `/admin`
3. ✅ See Admin Control Center
4. ✅ Manage platform

Enjoy! 🎉
