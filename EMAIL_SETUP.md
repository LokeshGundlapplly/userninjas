# Email & Authentication Setup

## Current Implementation

This project uses **Supabase Auth** exclusively for email management and multi-factor authentication. The system implements a secure two-step login process that requires email confirmation on signup and OTP verification on login.

### Signup Flow
1. User registers with email, password, full name, and role (tester/recruiter)
2. Supabase Auth sends a confirmation email to the provided address
3. User clicks the confirmation link in their email to activate the account
4. Account is now confirmed and ready for login

**Configuration:**
- Supabase Auth is configured with email confirmations enabled
- Email templates are customized in `/supabase/templates/`
- Custom SMTP can be configured in Supabase project settings

### Login Flow
1. User enters email and password on the login form
2. System validates credentials with Supabase Auth
3. Once password is verified, system triggers OTP (One-Time Password) generation
4. OTP (6-digit code) is sent to user's email
5. User enters OTP on the verification screen
6. OTP is verified against the database
7. User is granted access and signed in to their dashboard

**Verification Layers:**
- Email confirmation requirement (protects against wrong/disposable emails)
- OTP verification on login (adds security layer against credential theft)
- Database checks via edge functions for OTP validity
- Role loading and database verification after successful authentication

## Edge Functions

### 1. send-login-otp
- **Purpose:** Generate and store OTP codes for login verification
- **Location:** `supabase/functions/send-login-otp/index.ts`
- **Triggered by:** User login form after password validation
- **Requirements:**
  - User email must be confirmed
  - User must exist in Supabase Auth
- **Action:** 
  - Generates 6-digit random OTP
  - Stores OTP in `login_otps` table with 10-minute expiry
  - Logs OTP to console for development (replace with actual email sending)
- **Response:** `{ success: true, message: "OTP sent to email" }`

### 2. verify-login-otp
- **Purpose:** Validate OTP codes entered by user during login
- **Location:** `supabase/functions/verify-login-otp/index.ts`
- **Triggered by:** User submitting OTP on verification screen
- **Action:** 
  - Retrieves OTP from database
  - Validates it matches email and hasn't expired
  - Deletes used OTP to prevent replay attacks
- **Response:** `{ success: true, userId: "<user_id>", message: "OTP verified successfully" }`
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
Multi-step authentication UI with 4 distinct flows:

1. **form** - Sign up/sign in form
   - Sign up: Collects email, password, full name, and role selection
   - Sign in: Email/password credentials
   - Form validation with real-time error messages
   
2. **confirm** - Email confirmation instructions
   - Shows email address for reference
   - Displays confirmation email content guidelines
   - Resend confirmation email button with 60-second cooldown
   - Back button to return to form

3. **otp** - OTP verification during login
   - Displays masked email address
   - 6-digit numeric input with monospace font
   - Only enables verify button when all digits entered
   - Resend OTP button with 60-second cooldown
   - Back button cancels login process

4. **forgot** - Password reset flow
   - Email input field
   - Sends reset link via Supabase Auth
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

### Using Supabase Default SMTP
If using Supabase's built-in email service:
1. No additional configuration needed
2. Emails sent automatically to confirmation email address
3. Free tier includes email sending

### Using Custom SMTP Provider
To use external email service (SendGrid, AWS SES, Gmail, etc.):
1. Go to Supabase Dashboard → Project Settings → Authentication → SMTP Settings
2. Configure provider credentials
3. Test email sending in dashboard
4. Confirmation emails will use your custom provider

### Development & Testing
**For development without external email:**
OTP codes are logged to the Supabase function logs:
```
OTP for user@example.com: 123456
```

**To view during development:**
1. Go to Supabase Dashboard → Functions → send-login-otp
2. View the function logs in real-time
3. Extract the OTP code for manual testing

### Email Templates
Branded email templates in `/supabase/templates/`:
- `confirmation.html` - Account confirmation email
- `recovery.html` - Password reset email
- `magic_link.html` - Magic link sign-in
- `email_change.html` - Email change confirmation
- `invite.html` - Invitation to join
- `reauthentication.html` - Re-auth verification

**Template Variables:**
- `{{ .ConfirmationURL }}` - Link to confirm email
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your application URL

## Testing the Auth Flow

### 1. Test Signup
```bash
# Visit signup form in browser
# Fill in: name, email, password, select role
# Receive confirmation email
# Click confirmation link
# Email should be confirmed
```

### 2. Test Login with OTP
```bash
# Visit signin form
# Enter email and password
# System sends OTP code
# Check logs or email for code
# Enter 6-digit code
# Should be logged in to dashboard
```

### 3. Curl Test (for API testing)
```bash
# Start edge function locally
supabase start

# Test send-login-otp function
curl -X POST "http://localhost:54321/functions/v1/send-login-otp" \
  -H "Authorization: Bearer $(supabase auth list | grep -i anon)" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test verify-login-otp function
curl -X POST "http://localhost:54321/functions/v1/verify-login-otp" \
  -H "Authorization: Bearer $(supabase auth list | grep -i anon)" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
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

**Root Cause:** SMTP (email service) is not configured in your Supabase project.

**Solution - Configure SMTP in Supabase Dashboard:**

1. **Go to:** https://supabase.com/dashboard
2. **Select project:** userninjas (`jpclnzgouzyroebjvcqp`)
3. **Navigate to:** Project Settings → Authentication → SMTP Settings
4. **Choose email provider:**

#### Option A: Use Supabase Built-in Email (Simplest)
- No additional configuration needed
- Free tier includes email sending
- Limited to reasonable email volume per day
- Just ensure toggle is **enabled** (default)

#### Option B: SendGrid (Recommended)
1. Sign up at https://sendgrid.com (free tier available)
2. Create API key in SendGrid dashboard
3. In Supabase SMTP Settings enter:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Auth method: Login
   Username: apikey
   Password: <Your SendGrid API Key>
   Sender email: noreply@userninjas.in
   Sender name: User Ninjas
   ```
4. Click "Send test email"
5. If successful, signup emails will now work

#### Option C: Resend
1. Sign up at https://resend.com
2. Get your API key
3. In Supabase SMTP Settings enter:
   ```
   Host: smtp.resend.com
   Port: 465
   Auth method: Login
   Username: resend
   Password: <Your Resend API Key>
   Sender email: onboarding@resend.dev
   Sender name: User Ninjas
   ```
4. Click "Send test email"
5. If successful, signup emails will now work

**After configuring SMTP:**
1. Try signing up again with a test email
2. Check your inbox for confirmation email (check spam folder too)
3. Click confirmation link
4. You should now be able to login with OTP verification

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
