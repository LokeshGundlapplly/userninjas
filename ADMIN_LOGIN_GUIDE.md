# Admin Login & Setup Guide

## Quick Start: Get Admin Access

### Option 1: Reset Password (Recommended)
If you don't remember the password for `apple.mypic@gmail.com`:

1. Go to https://www.userninjas.in
2. Click **"Sign In"**
3. Click **"Forgot Password"** link
4. Enter: `apple.mypic@gmail.com`
5. Check your email for password reset link
6. Click the link and set a new password
7. Login with your new password

### Option 2: Use Your Original Password
If you remember the password you created for this account:
- Email: `apple.mypic@gmail.com`
- Password: [the one you originally set]

---

## After Logging In: Promote to Admin

Once you successfully login, the app will:
1. ✅ Auto-create your profile
2. ✅ Auto-assign 'tester' role
3. ❌ Redirect to `/tester` (tester dashboard)

To become **admin**, run this SQL query in Supabase:

**Go to:** https://app.supabase.com → SQL Editor

**Paste this query:**
```sql
-- Remove tester role
DELETE FROM user_roles
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'apple.mypic@gmail.com')
AND role = 'tester';

-- Add admin role
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM profiles
WHERE email = 'apple.mypic@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify
SELECT p.email, ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'apple.mypic@gmail.com';
```

**Expected output:**
```
apple.mypic@gmail.com → admin ✅
```

---

## Final Step: Access Admin Panel

1. **Logout** from the app (or close browser tab)
2. **Clear cache** (optional: F12 → Storage → Clear Site Data)
3. **Login again** with `apple.mypic@gmail.com`
4. ✅ Should redirect to `/admin` dashboard

---

## Troubleshooting

**Q: Email not arriving?**
- Check spam/promotions folder
- Wait 30 seconds and check again
- Try again after 5 minutes

**Q: Still redirects to `/tester` after promotion?**
- Make sure you ran the SQL query in Supabase
- Clear browser cache: F12 → Storage → Clear Site Data
- Close browser completely and reopen

**Q: Can't remember any password?**
- Use "Forgot Password" to reset
- All passwords are securely managed by Supabase

---

**Status:** Ready to setup admin account
**Next Step:** Reset password or login with your password
