# OTP Verification Troubleshooting Guide

## Quick Debugging Steps

### Step 1: Check Browser Console
1. Open your app in browser (http://localhost:5173)
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Try signing in with OTP
5. Look for these messages:
   - `✓ OTP sent via Supabase built-in method` → Using Supabase OTP
   - `✓ OTP sent via edge function` → Using custom edge function
   - `⚠ Supabase OTP failed, trying edge function:` → Supabase failed, falling back
   - `✗ Both OTP methods failed:` → Both failed (check error message)

### Step 2: Check Email Received
1. During local testing, emails go to **Mailpit** (http://localhost:54324)
2. Open Mailpit in browser
3. Look for email with subject: **"Your User Ninjas verification code 🔐"**
4. The email should display the 6-digit code prominently
5. Copy the exact code (no spaces or dashes)

### Step 3: Verify the Code Format
The code should be:
- ✅ Exactly 6 digits: `123456`
- ✅ No spaces: `12 34 56` ❌ WRONG
- ✅ No dashes: `12-34-56` ❌ WRONG
- ✅ No letters or symbols

### Step 4: Check OTP Method Used
After seeing the OTP code in email, check the frontend to confirm which method is being used:

**If using Supabase method:**
- Email is sent by Supabase Auth
- Uses built-in `signInWithOtp()` for verification
- Token should be the 6-digit code
- Must use `signInWithOtp({ email, token, type: 'email' })`

**If using Edge Function method:**
- Email is sent via Resend (custom edge function)
- Code is stored in `login_otps` table
- Verification calls `verify-login-otp` edge function
- Then signs in with password

---

## Common Issues & Fixes

### Issue 1: "Invalid or expired code"

**Cause 1A: Wrong OTP method in verification**
```
❌ Wrong: Supabase sends code via edge, but verify tries Supabase method
```
**Fix:** Ensure both send and verify use the same method
- Check console logs to see which method was used for sending
- Code comes from Mailpit - verify format matches

**Cause 1B: Code already used**
```
If you tried multiple times, the code may be deleted after first attempt
```
**Fix:** Click "Resend Code" and use the new code immediately

**Cause 1C: Code expired**
```
OTP expires in 1 hour (3600 seconds in config.toml)
```
**Fix:** Request a new code if > 1 hour has passed

**Cause 1D: User not confirmed**
```
If using edge function, email must be confirmed in Supabase Auth
```
**Fix:** Make sure you've confirmed your email address

### Issue 2: "Code not found"

**Cause:** Email not stored in database
**Fix:** 
- Check Mailpit - did you receive the email?
- Check that `send-login-otp` function was deployed
- Run: `supabase functions list` to verify deployment

### Issue 3: Edge function returns 404

**Cause:** Function not deployed or wrong name
**Fix:**
```bash
# Check deployed functions
supabase functions list

# Deploy if missing
supabase functions deploy send-login-otp
supabase functions deploy verify-login-otp
```

### Issue 4: Still redirecting to login after verification

**Cause:** Role not assigned or session not created
**Fix:**
- Check browser console for role fetch error
- Verify user has a role in `user_roles` table
- Check `/recruiter`, `/tester`, `/admin` routes exist

---

## Testing Workflow

### Local Testing with Mailpit

1. **Start Supabase:**
   ```bash
   supabase start
   # Mailpit available at http://127.0.0.1:54324
   ```

2. **Open Frontend:**
   ```bash
   bun dev
   # App at http://localhost:5173
   ```

3. **Sign In Flow:**
   - Go to http://localhost:5173/auth
   - Enter email + password
   - Click "Sign In"
   - Get OTP code from Mailpit
   - Enter code in input fields
   - Click "Verify & Sign In"

4. **Check Logs:**
   - Browser Console (F12) → Console tab
   - Look for method being used
   - Check for error messages

5. **Verify Database:**
   - If using edge method:
   ```sql
   SELECT * FROM login_otps 
   WHERE email = 'your@email.com' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

---

## OTP Method Decision Logic

```
sendOtpCode() is called:
    ↓
    Try Supabase auth.signInWithOtp()
    ↓
    If no error → return 'supabase'
    ↓
    If error → Try edge function send-login-otp()
    ↓
    If success → return 'edge'
    ↓
    If both fail → throw error
```

The method returned is stored in `otpMethod` state and used for verification.

---

## Database Queries for Debugging

### Check OTP Records (Edge Method)
```sql
SELECT id, email, otp, created_at, expires_at, verification_status, verification_attempts
FROM login_otps
WHERE email = 'test@example.com'
ORDER BY created_at DESC;
```

### Check User Roles
```sql
SELECT * FROM user_roles
WHERE user_id = 'user-id-here';
```

### Check Authentication Events
```sql
SELECT * FROM audit_log
WHERE actor_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Network Inspection

### Using Browser DevTools Network Tab

1. Open DevTools → **Network** tab
2. Filter by "functions" or "invoke"
3. Look for:
   - `send-login-otp` call → check response body for `{ success: true }`
   - `verify-login-otp` call → check response body for `{ success: true, userId: "..." }`
   - `signInWithOtp` call → check for valid token

### Check Response Bodies

**send-login-otp success:**
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

**send-login-otp error:**
```json
{
  "error": "User not found or email not confirmed"
}
```

**verify-login-otp success:**
```json
{
  "success": true,
  "userId": "abc123",
  "message": "OTP verified successfully"
}
```

**verify-login-otp error:**
```json
{
  "error": "Invalid or expired OTP"
}
```

---

## Environment Variables Check

Make sure these are set in Supabase:

```bash
# For edge functions (if using custom method)
SUPABASE_URL=<your-project-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
RESEND_API_KEY=<your-resend-key>

# These are auto-configured locally
# Check with: supabase status
```

---

## Manual Testing Edge Function

Test the edge function directly:

```bash
# Send OTP
curl -X POST http://localhost:54321/functions/v1/send-login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'

# Response should be:
# {"success": true, "message": "OTP sent to email"}
```

---

## Check Logs

### Supabase Edge Function Logs
```bash
supabase functions list
# Then check the specific function logs
supabase functions delete send-login-otp
supabase functions deploy send-login-otp
```

### Browser Console Logs
Should show OTP method being used and any errors during verification

### Supabase Dashboard Logs
1. Go to Supabase Dashboard
2. Functions → Logs
3. Filter by function name
4. Look for errors in execution

---

## Common Success Indicators

✅ When OTP verification is working:
- Email received in Mailpit with 6-digit code
- Code entered successfully without errors
- User redirected to dashboard
- Role displayed correctly in header/sidebar

✅ Console logs show:
```
✓ OTP sent via Supabase built-in method
// or
✓ OTP sent via edge function

// Then after entering code:
[Verified!] Redirecting to your dashboard...
```

✅ Network requests show success:
- `send-login-otp` → 200 with `{"success": true}`
- `verify-login-otp` or `signInWithOtp` → 200 with user session
- Role fetch → 200 with role data

---

## Still Not Working?

1. **Restart everything:**
   ```bash
   supabase stop
   supabase start
   bun dev
   ```

2. **Check if functions are deployed:**
   ```bash
   supabase functions list
   ```

3. **Clear browser cache:**
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear "All time"
   - Go to http://localhost:5173

4. **Check email config:**
   ```bash
   supabase status
   # Verify Mailpit is running at port 54324
   ```

5. **Share console logs** with error details for further debugging

---

## OTP Verification Flow Diagram

```
User Sign-In Page
    ↓
[Email + Password] → handleSubmit()
    ↓
signIn(email, password) → Password verified
    ↓
sendOtpCode(email)
    ├→ Try: supabase.auth.signInWithOtp() 
    │  ├→ No error? → otpMethod = 'supabase' ✓
    │  └→ Has error? → Try edge function
    │
    └→ Try: supabase.functions.invoke('send-login-otp')
       ├→ Success? → otpMethod = 'edge' ✓
       └→ Error? → Throw error ✗
    ↓
supabase.auth.signOut() → Clear session
    ↓
setStep('otp') → Show OTP input screen
    ↓
User enters 6-digit code from email
    ↓
handleVerifyOtp()
    ├→ If otpMethod === 'edge':
    │  ├→ Call: verify-login-otp edge function
    │  └→ If verified: signIn(email, password) again
    │
    └→ If otpMethod === 'supabase':
       └→ Call: supabase.auth.signInWithOtp({ email, token, type: 'email' })
    ↓
Verification successful → Fetch user role
    ↓
Navigate to dashboard (/recruiter, /tester, /admin)
```

---

## Next Steps

1. Check browser console for logs and errors
2. Verify email received in Mailpit
3. Try with the exact code from email
4. Check which method is being used
5. Share console errors if still failing
