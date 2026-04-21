# Supabase Email OTP Configuration Guide

## ✅ Current Configuration Status

### Environment Variables (VERIFIED)
```env
✅ VITE_SUPABASE_URL=https://jpclnzgouzyroebjvcqp.supabase.co
✅ VITE_SUPABASE_PROJECT_ID=jpclnzgouzyroebjvcqp
✅ VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc... (JWT anon key)
```

---

## 🔧 Required Supabase Dashboard Settings

### Step 1: Enable Email Provider

1. Open: https://app.supabase.com/project/jpclnzgouzyroebjvcqp
2. Go to: **Authentication** → **Providers**
3. Find **Email** provider
4. Toggle **Enable Email** to ON
5. Ensure these are checked:
   - ✅ Enable Email
   - ✅ Enable OTP (One-Time Password)
6. Set **OTP Expiry**: `3600` seconds (1 hour)
7. Click **Save**

### Step 2: Configure Email Template

1. Go to: **Authentication** → **Email Templates**
2. Find **Confirmation email** template
3. Verify template contains OTP placeholder: `{{ .ConfirmationURL }}`
4. Template should include verification link or OTP code
5. Click **Save** if modified

### Step 3: Set Redirect URLs

1. Go to: **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://www.userninjas.in`
3. Add **Redirect URLs**:
   ```
   https://www.userninjas.in/auth
   https://www.userninjas.in/auth?verified=true
   http://localhost:8082/auth
   http://localhost:8082/auth?verified=true
   ```
4. Click **Save**

### Step 4: Configure SMTP (Optional but Recommended)

For production emails:

1. Go to: **Email** → **SMTP Settings**
2. Enable **Custom SMTP** (if available)
3. Or use Supabase's default email service
4. Verify sender email is configured

---

## 🧪 Test Email OTP

### Test in Application

1. Start dev server: `npm run dev`
2. Open browser: http://localhost:8082
3. Click "Sign In"
4. Enter your email: `test@example.com`
5. Enter password and verify
6. You should receive OTP email
7. Enter 8-digit code from email
8. Should redirect to dashboard

### Test via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref jpclnzgouzyroebjvcqp

# Send test OTP
supabase functions invoke send-login-otp --project-ref jpclnzgouzyroebjvcqp \
  --header "Content-Type: application/json" \
  --body '{"email":"test@example.com"}'
```

---

## 🔐 Security Checklist

- ✅ JWT anon key in `.env` (correct format)
- ✅ Service role key NOT in `.env` (keep secret)
- ✅ Personal Access Token NOT used in app
- ✅ Email provider enabled
- ✅ OTP expiry set (3600 seconds)
- ✅ Redirect URLs configured
- ✅ Site URL matches deployment domain

---

## 📧 Email Testing

### Using Supabase Test Email

Supabase provides test email during development:
- To: Any email address
- Subject: "Your confirmation link"
- Body: Contains OTP or confirmation link

### Production Email Setup

For live deployment:
1. Configure SendGrid/Mailgun integration
2. Set sender email in Supabase dashboard
3. Verify sender domain
4. Configure SPF/DKIM records

---

## 🚀 Expected Flow After Setup

1. User signs in with email
2. OTP sent to email address
3. User receives email with 8-digit code
4. User enters code in app
5. Session established
6. User redirected to dashboard

---

## ✅ Verification Steps

- [ ] Email provider enabled in Supabase
- [ ] OTP settings configured (3600s expiry)
- [ ] Redirect URLs added
- [ ] Email templates verified
- [ ] SMTP configured (if needed)
- [ ] Test OTP sent successfully
- [ ] App receives and processes OTP
- [ ] User redirects to dashboard

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://app.supabase.com/project/jpclnzgouzyroebjvcqp
- **Authentication Providers**: https://app.supabase.com/project/jpclnzgouzyroebjvcqp/auth/providers
- **Email Templates**: https://app.supabase.com/project/jpclnzgouzyroebjvcqp/auth/templates
- **URL Configuration**: https://app.supabase.com/project/jpclnzgouzyroebjvcqp/auth/url-configuration

---

## 📞 Support

If OTP verification still fails after these steps:

1. Check Supabase logs: **Logs** → **Auth**
2. Verify email provider is enabled
3. Check redirect URLs are correctly set
4. Ensure OTP code hasn't expired
5. Try signing in again

