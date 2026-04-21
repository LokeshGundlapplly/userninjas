# OTP Sign-In Configuration - Complete Fix

## Problem Identified
You were seeing a **magic link** email instead of a **6-digit OTP code** during sign-in/signup because Supabase had the magic link template configured but no OTP template.

## Changes Made

### 1. ✅ Created OTP Email Template
**File**: `supabase/templates/otp.html`

- Displays 6-digit verification code prominently: `{{ .Token }}`
- Matches your brand (User Ninjas blue gradient)
- Explains code expires in 15 minutes
- Includes security warning not to share the code

### 2. ✅ Updated Supabase Configuration
**File**: `supabase/config.toml`

**Changed**:
```toml
# Before: Had magic_link template
[auth.email.template.magic_link]
subject = "Your User Ninjas sign-in link 🔗"
content_path = "./templates/magic_link.html"

# After: Now uses OTP template
[auth.email.template.otp]
subject = "Your User Ninjas verification code 🔐"
content_path = "./templates/otp.html"
```

**Result**: When users sign in or sign up, they receive a 6-digit code instead of a magic link.

### 3. ✅ Updated Sign-Up Flow
**File**: `src/pages/Auth.tsx`

**Changed**:
- Sign-up now triggers OTP verification immediately after account creation
- Users are sent a 6-digit code via email
- Users must enter the code to activate their account (no more confirmation link)
- Same flow as sign-in: OTP verification step before dashboard access

**Before**:
```
Sign Up → Confirmation Email with Magic Link → Click Link → Activate
```

**After**:
```
Sign Up → OTP Email with 6-Digit Code → Enter Code → Activate
```

---

## Current OTP Flow

### Sign-Up
1. User enters email, password, name, and role
2. Account created in Supabase
3. 6-digit OTP sent to email
4. User enters code on verification screen
5. Account activated → Redirected to dashboard

### Sign-In
1. User enters email and password
2. Password verified
3. 6-digit OTP sent to email
4. User enters code on verification screen
5. Authenticated session created → Redirected to dashboard

---

## Email Template Variables

The OTP template uses:
- `{{ .Token }}` - The 6-digit verification code (displayed prominently)
- `{{ .Data }}` - Optional custom data

---

## Testing the Flow

### Local Testing
```bash
# 1. Start Supabase (already running)
supabase start

# 2. Test sign-up
# - Go to http://localhost:5173/auth
# - Click "Create account"
# - Use test email (Mailpit captures local emails)
# - Check Mailpit at http://127.0.0.1:54324
# - You should see 6-digit code, NOT a magic link

# 3. Test sign-in
# - Sign out
# - Enter email and password
# - You should receive 6-digit code
```

### View Emails Locally
- **Mailpit**: `http://127.0.0.1:54324`
- All emails sent by Supabase appear here during development

---

## Troubleshooting

### Still seeing magic link emails?
1. **Clear browser cache** - Old email templates may be cached
2. **Check Supabase status** - Run `supabase status` to verify config is applied
3. **Restart Supabase** - Run `supabase stop && supabase start`
4. **Verify template path** - Ensure `supabase/templates/otp.html` exists

### Code not receiving emails?
1. Check Mailpit at `http://127.0.0.1:54324`
2. Verify email address is correct in signup form
3. Check that `send-login-otp` function is deployed (`supabase functions list`)
4. Look for OTP errors in browser console (F12 DevTools)

### OTP Expires Too Quickly
- Expiry time is set in `config.toml`: `otp_expiry = 3600` (1 hour)
- Can be adjusted if needed

---

## Configuration Summary

| Setting | Value | Purpose |
|---------|-------|---------|
| `otp_length` | 6 | Digit length of verification code |
| `otp_expiry` | 3600 | Seconds before code expires (1 hour) |
| OTP Template | `supabase/templates/otp.html` | Email sent with 6-digit code |
| Email Provider | Enabled | OTP auth method enabled |

---

## Related Files

- **Auth Page**: `src/pages/Auth.tsx` - OTP verification UI
- **Auth Hook**: `src/hooks/useAuth.tsx` - Sign-up/sign-in logic
- **Config**: `supabase/config.toml` - Email template configuration
- **OTP Template**: `supabase/templates/otp.html` - Email HTML

---

## What Happens When User Enters OTP

```typescript
// From Auth.tsx handleVerifyOtp()
1. User enters 6 digits
2. Verify against Supabase OTP
3. If correct:
   - Create authenticated session
   - Store user role in database
   - Redirect to dashboard (recruiter, tester, or admin)
4. If incorrect:
   - Show error toast
   - Allow retry
   - Offer resend after max attempts
```

---

## Next Steps

1. **Test the flow locally** using Mailpit
2. **Deploy to production** when ready
3. **Monitor OTP delivery** using Supabase dashboard analytics
4. **Customize timeout** if users need more/less time to verify

All configuration is now complete! 🎉
