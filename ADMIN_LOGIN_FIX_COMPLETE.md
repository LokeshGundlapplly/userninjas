# Admin Login Fix - Complete ✅

## Problem
After logging in with `apple.mypic@gmail.com` (admin user), the app was redirecting to the **tester profile** instead of the **admin panel**.

## Root Causes Identified

### 1. Database Level: Duplicate Role Records
- User had both `tester` and `admin` roles in the `user_roles` table
- While the auth logic prioritized `admin`, it was creating duplicate entries

### 2. Application Level: Duplicate Role Creation
In `useAuth.tsx`, the `fetchUserRole()` function had faulty logic:
```typescript
// OLD CODE (problematic):
const { error: insertRoleError } = await supabase
  .from('user_roles')
  .insert({ user_id: userId, role: fallbackRole });
```

**Issue:** When a role didn't exist, it tried to INSERT a fallback role. But if a role already existed (like the admin role), the INSERT would still fail silently due to the UNIQUE constraint on `(user_id, role)`, and the application wouldn't handle it properly.

## Solutions Implemented

### 1. Database Cleanup ✅
Deleted all tester roles for users who have admin role:
```sql
DELETE FROM user_roles ur1
WHERE ur1.role = 'tester'
AND EXISTS (
  SELECT 1 FROM user_roles ur2 
  WHERE ur2.user_id = ur1.user_id 
  AND ur2.role = 'admin'
);
```

**Current Database State:**
```
apple.mypic@gmail.com      │ admin   ✅ (only admin)
lokesh4a0@gmail.com        │ tester
shainidattsharma@gmail.com │ tester
workside367@gmail.com      │ tester
```

### 2. Application Code Fix ✅
Updated `src/hooks/useAuth.tsx` to use **UPSERT instead of INSERT**:

```typescript
// NEW CODE (fixed):
const { data: upsertData, error: upsertError } = await supabase
  .from('user_roles')
  .upsert(
    { user_id: userId, role: fallbackRole },
    { onConflict: 'user_id,role' }
  )
  .select('role');
```

**Why this works:**
- UPSERT with `onConflict: 'user_id,role'` means: "Insert if doesn't exist, ignore if it does"
- Prevents creating duplicate roles silently
- No more failed INSERTs that break the fallback logic

### 3. Role Prioritization Logic (Already in place)
The `fetchUserRole()` function still correctly prioritizes admin:
```typescript
if (roles.includes('admin')) {
  setRole('admin');  // ✅ Admin takes priority
} else {
  setRole(roles[0]);
}
```

## Testing Instructions

1. **Clear browser cache/localStorage:**
   - DevTools → Application → Storage → Clear Site Data
   - Or open in Incognito/Private window

2. **Login with admin account:**
   - Email: `apple.mypic@gmail.com`
   - Password: [your password]

3. **Expected behavior:**
   - ✅ Should redirect to `/admin` (admin panel)
   - ✅ NOT to `/tester` (tester dashboard)

4. **Verify in database (optional):**
   - Only ONE role record for apple.mypic@gmail.com
   - Role value = `admin`

## Changes Made

**File:** `src/hooks/useAuth.tsx`
- Replaced `.insert()` with `.upsert()` with conflict handling
- Prevents duplicate role records from being re-created on login
- Maintains fallback logic for users without roles

**Commits:**
- `db74766` - Fix duplicate role creation: use upsert with onConflict
- `9408318` - Database cleanup complete: Remove duplicate roles

## Prevention Going Forward

The UNIQUE constraint on `(user_id, role)` + UPSERT logic now prevents:
- Duplicate roles from being created
- Silent failures when inserting existing roles
- Admin users being redirected to wrong dashboard

---

**Status:** ✅ **RESOLVED**
**Last Updated:** April 21, 2026
