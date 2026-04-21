# 🔧 Troubleshooting Admin Redirect Issue

## Issue: "Access denied" - Dashboard only for testers

### Why This Happens

When you access `/tester` dashboard, the system checks your role:
- ✓ If role = 'tester' → Shows dashboard
- ✗ If role = 'admin' → Blocks access ("This dashboard is only for testers")
- ✗ If role = anything else → Redirects away

---

## Solution: Complete Setup (DO NOT SKIP STEPS)

### Step 1: Verify Admin Role is Set in Database

Go to **[Supabase Dashboard](https://app.supabase.com) → SQL Editor → New Query**

**Query A** - Find your user:
```sql
SELECT user_id, email FROM profiles WHERE email = 'apple.mypic@gmail.com';
```

**Copy the user_id** (looks like: `550e8400-e29b-41d4-a716-446655440000`)

---

### Step 2: Check Current Role

**Query B** - Check what role you currently have:
```sql
SELECT ur.user_id, ur.role, p.email 
FROM user_roles ur 
LEFT JOIN profiles p ON ur.user_id = p.user_id 
WHERE p.email = 'apple.mypic@gmail.com';
```

**Results:**
- Shows `role = 'admin'` → Skip to Step 4 ✓
- Shows `role = 'tester'` → Continue to Step 3
- No results → Continue to Step 3

---

### Step 3: Set Admin Role (If Not Already Set)

**Query C** - Replace `YOUR_USER_ID` with the UUID from Query A:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Click **Run** → Should say "INSERT 0" (even if no rows inserted, that's OK)

Verify with Query B above - should now show `role = 'admin'`

---

### Step 4: Clear Browser Cache & Logout

1. **Logout**: Click profile → Logout (or go to https://www.userninjas.in and logout)
2. **Clear Cache**: Open DevTools (F12) → Application → Clear Site Data
3. **Close Browser Tab**: Fully close the tab

---

### Step 5: Login Again

1. Go to https://www.userninjas.in
2. Login with `apple.mypic@gmail.com` + your password
3. **Should auto-redirect to `/admin`** ✓

---

## What Should Happen

**After Step 5 login:**
- ✓ Auth.tsx detects role = 'admin'
- ✓ Automatically navigates to `/admin`
- ✓ AdminPanel loads with 7 tabs
- ✓ No more "access denied" errors

---

## If Still Not Working

**Issue**: Still seeing "access denied" or not redirecting to /admin

**Check these:**

1. **Role not actually set?**
   - Re-run Query B to verify admin role exists in database

2. **Session not refreshed?**
   - Logout completely
   - Close browser
   - Clear cookies
   - Login again

3. **Browser cache?**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Local database issue?**
   - Go to Supabase Dashboard
   - Check Authentication → Users
   - Verify `apple.mypic@gmail.com` exists
   - Check user_roles table directly

---

## Debug Info

Add this to your browser console to check your current role:

```javascript
// Check what Supabase thinks your role is
const session = await supabase.auth.getSession();
console.log('Session:', session);

// Check user_roles table directly
const {data} = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', session.data.session.user.id);
console.log('Your role:', data);
```

---

## Key Points

✓ Admin role MUST be set in user_roles table  
✓ Browser cache MUST be cleared after setting role  
✓ You MUST logout and login again  
✓ Auth.tsx WILL redirect to /admin automatically  
✓ Never manually navigate to /tester (admins aren't allowed)  

---

## Bulk Update: Change All Users to Admin Role

### Query 1: View All Current Roles (Before Update)
```sql
SELECT ur.user_id, ur.role, p.email, COUNT(*) 
FROM user_roles ur 
LEFT JOIN profiles p ON ur.user_id = p.user_id 
GROUP BY ur.user_id, ur.role, p.email
ORDER BY ur.role, p.email;
```

---

### Query 2: Update All Testers to Admin
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE role = 'tester';
```

---

### Query 3: Update All Recruiters to Admin
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE role = 'recruiter';
```

---

### Query 4: Update ALL Non-Admin Users to Admin (One Command)
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE role != 'admin';
```

---

### Query 5: Verify All Users Are Now Admin
```sql
SELECT ur.user_id, ur.role, p.email 
FROM user_roles ur 
LEFT JOIN profiles p ON ur.user_id = p.user_id 
ORDER BY p.email;
```

**Should all show `role = 'admin'` ✓**

---

## Complete Process:

1. **Run Query 1** - Check current state (testers, recruiters count)
2. **Run Query 4** - Update everyone to admin
3. **Run Query 5** - Verify all are admin
4. **Clear cache & logout** (same as Step 4 above)
5. **Login again** - All users will auto-redirect to `/admin`

---

**Status**: Ready to become admin! Follow steps 1-5 above.
