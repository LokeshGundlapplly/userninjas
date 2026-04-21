# Email & Authentication Setup

## Current Implementation

This project uses **Supabase Auth** for authentication with **Resend** as the email provider. Resend handles both Supabase's built-in auth emails (confirmation, recovery, etc.) via SMTP and custom transactional emails (OTP codes, notifications) via the Resend API through edge functions.

### Email Provider: Resend
- **SMTP**: Configured in Supabase Dashboard for auth emails (confirmation, password reset, etc.)
- **API**: Used in edge functions for transactional emails (OTP codes, review notifications)
- **Domain**: `userninjas.in` (DNS verified)
- **Sender**: `noreply@userninjas.in`

### Signup Flow
1. User registers with email, password, full name, and role (tester/recruiter)
2. Supabase Auth sends a confirmation email via Resend SMTP
3. User clicks the confirmation link to activate their account
4. Account is confirmed and ready for login

### Login Flow
1. User enters email and password
2. System validates credentials with Supabase Auth
3. User is signed in and redirected to their role-based dashboard

### Password Reset Flow
1. User clicks "Forgot password?" and enters email
2. Supabase Auth sends recovery email via Resend SMTP
3. User clicks the link and sets a new password

## Edge Functions

### 1. send-login-otp
- **Purpose:** Generate OTP codes and send them via Resend API
- **Location:** `supabase/functions/send-login-otp/index.ts`
- **Requirements:**
  - User email must be confirmed in Supabase Auth
  - `RESEND_API_KEY` must be set as a Supabase secret
- **Action:** 
  - Generates 6-digit random OTP
  - Stores OTP in `login_otps` table with 10-minute expiry
  - Sends branded OTP email via Resend API
- **Response:** `{ success: true, message: "OTP sent to email" }`

### 2. verify-login-otp
- **Purpose:** Validate OTP codes entered by user
- **Location:** `supabase/functions/verify-login-otp/index.ts`
- **Action:** 
  - Retrieves OTP from database
  - Validates it matches email and hasn't expired
  - Deletes used OTP to prevent replay attacks
- **Response:** `{ success: true, userId: "<user_id>", message: "OTP verified successfully" }`

### 3. send-email
- **Purpose:** General-purpose transactional email via Resend API
- **Location:** `supabase/functions/send-email/index.ts`
- **Parameters:** `{ to, subject, html, from? }`
- **Requirements:** `RESEND_API_KEY` must be set as a Supabase secret

### 4. send-review-notification
- **Purpose:** Notify testers when their submissions are reviewed
- **Location:** `supabase/functions/send-review-notification/index.ts`
- **Parameters:** `{ submissionId, testTitle, testerEmail, testerName, status, feedback? }`
- **Status types:** `approved`, `rejected`, `needs_revision`
- **Errors:** Returns 401 for invalid/expired codes

## Database Tables

### login_otps
Stores temporary OTP codes for login verification:

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, auto-generated |
| email | TEXT | User's email address (indexed) |
| otp | TEXT | 6-digit verification code (indexed with email) |
| created_at | TIMESTAMP | When OTP was generated |
| expires_at | TIMESTAMP | 10-minute expiry time (indexed for cleanup) |
| verified_at | TIMESTAMP | When OTP was used (nullable) |

**Indexes:**
- `idx_login_otps_email_otp`: Fast lookups during verification
- `idx_login_otps_expires_at`: Enables efficient cleanup of expired records

**Row Level Security:**
- Service role can manage all OTP records (for edge functions)

## Frontend Components

### Auth Page (`src/pages/Auth.tsx`)
Multi-step authentication UI with 3 flows:

1. **form** - Sign up/sign in form
   - Sign up: Collects email, password, full name, and role selection
   - Sign in: Email/password credentials
   - Form validation with real-time error messages
   
2. **confirm** - Email confirmation instructions
   - Shows the email address for reference
   - Resend confirmation email button with 60-second cooldown
   - Back button to return to form

3. **forgot** - Password reset flow
   - Email input field
   - Sends reset link via Supabase Auth (delivered by Resend SMTP)
   - Confirmation message after sending

**Features:**
- Role selection (Tester/Recruiter) on signup
- Resend functionality for both confirmation email and OTP
- Form validation with error messages
- 60-second resend cooldown timer
- Responsive design with icon indicators
- Accessibility: proper labels, input modes, disabled states

### useAuth Hook (`src/hooks/useAuth.tsx`)
Context provider for auth state management:

**Methods:**
- `signUp(email, password, fullName, role)` - Creates new account via Supabase Auth
- `signIn(email, password)` - Validates email/password credentials
- `signOut()` - Logs user out and clears session
- `fetchUserRole(userId)` - Retrieves user role from database after sign in

**State Properties:**
- `user` - Current authenticated user object
- `session` - Current auth session with tokens
- `role` - User's role (tester/recruiter/admin)
- `loading` - Auth state initialization status

**Key Implementation:**
- Listens to Supabase auth state changes
- Auto-fetches role from `user_roles` table after sign in
- Handles admin role priority if user has multiple roles
- Redirects authenticated users to appropriate dashboard

## Email Configuration

### Resend SMTP Setup (Supabase Auth Emails)
Resend is configured as the custom SMTP provider in Supabase Dashboard. This handles all auth-related emails automatically:

**Supabase Dashboard → Project Settings → Authentication → SMTP Settings:**
```
Host: smtp.resend.com
Port: 465
Auth method: Login
Username: resend
Password: <Your Resend API Key>
Sender email: noreply@userninjas.in
Sender name: User Ninjas
```

### Resend API Key (Edge Functions)
Edge functions use the Resend API directly for transactional emails. Set the secret:
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Email Confirmations
Email confirmations are **enabled** in `supabase/config.toml`:
```toml
[auth.email]
enable_confirmations = true
```

Also ensure "Confirm email" is enabled in:
**Supabase Dashboard → Authentication → Providers → Email → Confirm email**

### Email Templates
Branded email templates in `/supabase/templates/` (used by Supabase Auth via SMTP):
- `confirmation.html` - Account confirmation email
- `recovery.html` - Password reset email
- `magic_link.html` - Magic link sign-in
- `email_change.html` - Email change confirmation
- `invite.html` - Invitation to join
- `reauthentication.html` - Re-auth verification

**Template Variables (Supabase Auth templates):**
- `{{ .ConfirmationURL }}` - Link to confirm email
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your application URL

**Edge function emails** (OTP, notifications) use inline HTML in the function code, matching the same brand style.

## Testing the Auth Flow

### 1. Test Signup
```bash
# Visit signup form in browser
# Fill in: name, email, password, select role
# Receive confirmation email via Resend
# Click confirmation link
# Email should be confirmed → redirect to sign in
```

### 2. Test Password Reset
```bash
# Click "Forgot password?" on login form
# Enter your email
# Receive recovery email via Resend
# Click reset link → set new password
```

### 3. Test Review Notification
```bash
# Call the send-review-notification edge function:
curl -X POST "https://itkmsjqiaphxwwekevqp.supabase.co/functions/v1/send-review-notification" \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "test-123",
    "testTitle": "Mobile App Checkout Flow",
    "testerEmail": "tester@example.com",
    "testerName": "John",
    "status": "approved",
    "feedback": "Great work on the detailed observations!"
  }'
```

## Security Considerations

✅ **Protections Implemented:**
- Email confirmation prevents account abuse with disposable/invalid emails
- OTP valid for only 10 minutes, reducing compromise window
- Used OTPs immediately deleted to prevent replay attacks
- Passwords never logged or displayed anywhere
- Service role keys used only for backend operations
- Row-level security on database tables

⚠️ **Best Practices:**
- Keep Supabase Keys secure (never commit to git)
- Rotate service role keys periodically
- Monitor email sending for abuse
- Rate limit OTP generation per email (future enhancement)
- Consider implementing bot detection on signup

## Troubleshooting

### ❌ "Error sending confirmation email"

**Root Cause:** SMTP is not configured or Resend API key is invalid.

**Solution:**
1. Verify Resend SMTP is configured in Supabase Dashboard → Authentication → SMTP Settings
2. Check DNS verification status at https://resend.com/domains
3. Ensure sender domain `userninjas.in` is verified in Resend
4. Click "Send test email" in Supabase SMTP settings to verify

### ❌ "RESEND_API_KEY is not configured"

**Solution:**
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### ❌ Confirmation email not arriving

1. Check spam/junk folder
2. Verify Resend domain status at https://resend.com/domains
3. Check Resend dashboard → Emails tab for delivery status
4. Ensure `enable_confirmations = true` in config.toml
5. Ensure "Confirm email" is ON in Supabase Dashboard → Authentication → Providers → Email

---

### "User not found or email not confirmed"
**Problem:** Trying to login before confirming email
**Solution:** 
1. Check your email for confirmation link
2. Click the link to activate account
3. Then try login again

### "Invalid or expired OTP"
**Problem:** OTP code is wrong or expired
**Solution:**
1. OTP codes valid for 10 minutes only
2. Click "Resend code" to get a fresh code
3. Enter the new code immediately

### Emails not being sent
**Problem:** Signup confirmation or OTP emails not arriving
**Solution:**
1. Check email spam/junk folder first
2. **Verify SMTP is configured:**
   - Go to https://supabase.com/dashboard
   - Select project → Settings → Authentication → SMTP Settings
   - Ensure SMTP provider is configured
3. **Check Supabase logs for errors:**
   - Go to Dashboard → Logs (at bottom left)
   - Filter by "auth" 
   - Look for email delivery errors or failures
4. **Test email delivery:**
   - In SMTP Settings, click "Send test email"
   - You should receive a test email within 30 seconds
   - If test email doesn't arrive, SMTP is misconfigured
5. **Verify email templates:**
   - Dashboard → Authentication → Email Templates
   - Ensure all templates are "Enabled"
   - Templates should have your branding

### OTP stuck in database
```sql
DELETE FROM public.login_otps
WHERE expires_at < NOW();
```

### Cannot see OTP in logs
**Solution for local development:**
1. Start Supabase locally: `supabase start`
2. Visit http://localhost:54321/functions/v1/status
3. Execute login flow via browser
4. Check terminal output for console.log statements
5. Or check Supabase Dashboard → Functions section

## Next Steps and Enhancements

### Planned Improvements
1. **Real Email Sending:** Replace console.log with actual email service integration
2. **Rate Limiting:** Prevent OTP abuse with request throttling
3. **SMS OTP Option:** Add SMS as alternative delivery method
4. **Backup Codes:** Provide backup codes for account recovery
5. **Biometric:** Add fingerprint/face recognition for mobile
6. **Session Management:** Implement device management and login history

### Email Service Integration
To integrate with SendGrid, Resend, or other providers:
1. Add service credentials to edge function environment
2. Update `send-login-otp` to call email service API
3. Replace console.log with actual send call
4. Include OTP in email template
5. Add retry logic for failed sends

## Support & Documentation

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Email Service Providers:**
  - SendGrid: https://sendgrid.com
  - Resend: https://resend.com
  - AWS SES: https://aws.amazon.com/ses
