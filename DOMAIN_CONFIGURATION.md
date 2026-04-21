# User Ninjas - Domain Configuration (userninjas.in)

## ✅ Completed Changes

### 1. Environment Configuration
- **File**: `.env`
- **Change**: Added `VITE_APP_DOMAIN=https://www.userninjas.in`
- **Status**: ✅ Configured

### 2. Frontend Authentication Redirects
- **File**: `src/pages/Auth.tsx`
- **Changes**:
  - Updated `getRedirectUrl()` to use `VITE_APP_DOMAIN` from environment
  - Forgot password flow redirects to `https://www.userninjas.in/reset-password`
  - Confirmation emails redirect to `https://www.userninjas.in/auth?verified=true`
  - OTP emails auto-fill from `https://www.userninjas.in/auth?email=...&code=...`
- **Status**: ✅ Deployed

### 3. Password Reset Page
- **File**: `src/pages/ResetPassword.tsx`
- **Changes**:
  - Enhanced error handling for invalid/expired recovery links
  - Option to request new reset link from `https://www.userninjas.in/auth?step=forgot`
- **Status**: ✅ Deployed

### 4. Email Templates & OTP Function
- **File**: `supabase/functions/send-login-otp/index.ts`
- **Changes**:
  - Updated to use environment variable `WEBSITE_DOMAIN`
  - Default domain: `https://www.userninjas.in`
  - Email verification link: `https://www.userninjas.in/auth?email=...&code=...`
  - "Enter Code Automatically" button points to userninjas.in
- **Status**: ✅ Deployed

### 5. Supabase Environment Variables
- **Variable**: `WEBSITE_DOMAIN=https://www.userninjas.in`
- **Status**: ✅ Set

### 6. Build Status
- **Status**: ✅ Production build successful (dist/ folder ready)

---

## 🔧 Manual Configuration Required in Supabase Console

### Email Provider Settings
1. Go to **Supabase Console** → **Authentication** → **Providers** → **Email**
2. Update **Redirect URLs**:
   - Add: `https://www.userninjas.in/auth`
   - Add: `https://www.userninjas.in/reset-password`
   - Add: `https://www.userninjas.in`

### Email Templates (if using custom templates)
Update all email templates in Supabase to use:
- **Domain**: `https://www.userninjas.in`
- **Logo**: `https://www.userninjas.in/logo.png`
- **Links**: `https://www.userninjas.in/[path]`

### Site URL Configuration
1. Go to **Supabase Console** → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://www.userninjas.in`
3. Set **Redirect URLs**:
   ```
   https://www.userninjas.in
   https://www.userninjas.in/auth
   https://www.userninjas.in/reset-password
   https://www.userninjas.in/recruiter
   https://www.userninjas.in/tester
   https://www.userninjas.in/admin
   https://www.userninjas.in/auth?step=forgot
   ```

---

## 📋 Testing Checklist

### Sign-Up Flow
- [ ] Visit `https://www.userninjas.in/auth`
- [ ] Create account → Check email for OTP
- [ ] Click "Enter Code Automatically" → Should redirect to `https://www.userninjas.in/auth?email=...&code=...`
- [ ] Form should auto-fill with email and code
- [ ] Verify code → Should redirect to recruiter/tester dashboard

### Sign-In Flow
- [ ] Visit `https://www.userninjas.in/auth`
- [ ] Sign in with email/password → Check email for OTP
- [ ] Click verification link → Should auto-fill and verify
- [ ] Redirect to dashboard

### Forgotten Password Flow
- [ ] Visit `https://www.userninjas.in/auth?step=forgot`
- [ ] Should show forgot password form
- [ ] Enter email → Should send reset link to `https://www.userninjas.in/reset-password`
- [ ] Click link in email → Password reset page loads
- [ ] Set new password → Should redirect to sign-in

---

## 📦 Deployment Instructions

### Production Deployment

1. **Deploy to Production**:
   ```bash
   # Build is already created
   npm run build
   
   # Deploy to your hosting (Vercel, etc.)
   vercel deploy --prod
   
   # Or if using another host, upload the dist/ folder
   ```

2. **Configure DNS**:
   - Point `userninjas.in` A record to your hosting provider's IP
   - Point `www.userninjas.in` CNAME to your hosting provider's domain
   - Add SSL certificate (Let's Encrypt or your host's certificate)

3. **Verify Supabase Settings**:
   - All redirect URLs must include `https://www.userninjas.in`
   - Email templates must reference `https://www.userninjas.in`
   - CORS settings should allow `https://www.userninjas.in`

### Environment Variables on Production

Set these in your deployment platform (Vercel, etc.):
```
VITE_SUPABASE_PROJECT_ID=jpclnzgouzyroebjvcqp
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_9ZzJz2DMLEawYKyzTHdhMw_knx2IdQ6
VITE_SUPABASE_URL=https://jpclnzgouzyroebjvcqp.supabase.co
VITE_APP_DOMAIN=https://www.userninjas.in
VITE_GROQ_API_KEY=your_actual_key
```

---

## 🔒 SSL/HTTPS Setup

All redirects use `https://www.userninjas.in` to ensure secure connections.

- Email verification links are HTTPS
- Password reset links are HTTPS
- All authentication flows use HTTPS
- Cookies will have Secure flag enabled

---

## 📞 Support

If you encounter issues:

1. **Emails not reaching inbox**: Check Supabase email configuration
2. **Redirect loop**: Verify Supabase Site URL matches `https://www.userninjas.in`
3. **Links return 404**: Ensure DNS is pointing to your hosting
4. **Session issues**: Clear browser cache and cookies for userninjas.in

For more help, check Supabase logs: **Supabase Console** → **Logs** → **Auth**
