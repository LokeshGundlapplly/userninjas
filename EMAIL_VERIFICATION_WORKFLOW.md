# Email Verification & Password Setup Workflow

## Overview
This document describes the new user signup and account verification workflow implemented in User Ninjas.

## Signup Flow

### Step 1: User Fills Signup Form
- **URL**: `/auth` (with signup mode)
- **Fields**:
  - Full Name ✓
  - Email ✓
  - Role Selection (Tester or Recruiter) ✓
  - **Password**: ❌ Hidden during signup
- **Action**: User clicks "Create Account"

### Step 2: Account Created with Temporary Password
- Backend generates a random temporary password
- Supabase creates user account with this temp password
- Account is not yet verified

### Step 3: Confirmation Email Sent
- **Email Template**: `supabase/templates/confirmation.html`
- **Subject**: "Confirm Your Email 🥷"
- **Link Redirect**: Points to `/verify-email` route
- **Validity**: 24 hours
- **User sees**: "Check your email to verify your account and set your password"

### Step 4: User Clicks Email Link
- Opens confirmation link from email
- Link contains Supabase confirmation token in URL hash
- User is automatically redirected to `/verify-email` page
- Supabase session is automatically established via the token

### Step 5: User Sets Password on Verify Page
- **URL**: `/verify-email`
- **Components**:
  - Email display (verified ✓)
  - Password field (first time setting)
  - Confirm password field
  - Validation: minimum 6 characters, must match

### Step 6: Password Saved to Database
- User clicks "Complete Account Setup"
- Frontend calls `supabase.auth.updateUser({ password })`
- Password is now permanently saved in Supabase Auth
- Email confirmed s
- Temporary password is replaced

### Step 7: Account Verified, User Redirected to Dashboard
- Verification complete page shows loading
- Fetches user role from database
- Redirects to appropriate dashboard:
  - Recruiter → `/recruiter`
  - Tester → `/tester`

## Sign In Flow (Unchanged)
- User still enters email + password on `/auth`
- OTP verification required after successful password authentication
- Then redirected to dashboard

## Reset Password Flow (Existing)
- User requests reset from "Forgot password?"
- Gets recovery email with `/reset-password` link
- Sets new password on reset page
- Same flow as before (no changes)

## Password Requirements
- Minimum 6 characters
- Should include: letters, numbers, symbols (recommended)
- Don't reuse passwords from other sites (recommended)

## Files Modified

### Frontend
- **`src/pages/Auth.tsx`**:
  - Removed password validation from signup
  - Hidden password field during signup
  - Changed signup flow to send confirmation email instead of OTP
  - Sign-in flow unchanged (still uses OTP)
  
- **`src/pages/VerifyEmail.tsx`** (NEW):
  - Handles email verification
  - Session validation from confirmation link
  - Password setup form
  - Auto-redirect to dashboard on success
  
- **`src/App.tsx`**:
  - Added `/verify-email` route
  - Points to VerifyEmail component

### Backend Config
- **`supabase/config.toml`**:
  - `site_url` correctly set to `https://www.userninjas.in`
  - Redirect URLs include `/verify-email` path

- **`supabase/templates/confirmation.html`** (existing):
  - Already uses `{{ .ConfirmationURL }}` variable
  - Works perfectly with new `/verify-email` redirect

## Database Changes
No database schema changes needed. Uses existing Supabase Auth system.

## Testing Checklist

- [ ] Sign up with new account
- [ ] Check email for confirmation link
- [ ] Click confirmation link from email
- [ ] Verify redirects to `/verify-email`
- [ ] Email display shows verified ✓
- [ ] Set password (minimum 6 chars)
- [ ] Confirm password matches
- [ ] Click "Complete Account Setup"
- [ ] See success animation
- [ ] Auto-redirect to dashboard (recruiter or tester)
- [ ] Can now sign in with email + new password
- [ ] Sign in triggers OTP verification
- [ ] Complete OTP to reach dashboard

## Error Handling

### If Confirmation Link Expires
- User sees: "Verification link may have expired. Please sign up again."
- Buttons: "Create New Account" or "Back to Sign In"
- Solution: User needs to sign up again

### If Email Delivery Fails
- Account created but confirmation email failed
- User can try signing in (will need to complete email verification first)
- Or sign up again with correct email

### If User Loses Confirmation Email
- User can sign in and initiate a password reset
- Or contact support to resend confirmation

## Email Configuration Required

Ensure in Supabase Console:
1. **Authentication > URL Configuration**:
   - Site URL: `https://www.userninjas.in`
   - Redirect URLs: Include `https://www.userninjas.in/verify-email`

2. **Email Templates**:
   - Confirmation template points to `/verify-email` route
   - Subject line: "Confirm Your Email 🥷"

## Security Notes

- Temporary password is cryptographically random
- Never shown to user
- Replaced when user sets real password
- Email verification required before account is fully active
- Password update requires valid Supabase session from confirmation token
- 24-hour expiration on confirmation links

## Rollback Plan

If needed to revert to OTP-only signup:
1. Restore original `Auth.tsx` handleSubmit
2. Remove `VerifyEmail.tsx` route
3. Restore password field to signup form
4. Revert `App.tsx` changes

## Future Enhancements

- [ ] Add "Resend Confirmation Email" button on confirm page
- [ ] Add email preferences during signup
- [ ] Add phone verification option
- [ ] Add 2FA setup after password creation
- [ ] Add profile picture upload on verify page
- [ ] Add onboarding questions after verification
