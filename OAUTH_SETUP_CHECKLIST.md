# OAuth Setup Checklist

Follow this checklist to enable LinkedIn and Google OAuth for your User Ninjas platform.

## 🔵 LinkedIn OAuth Setup (Testers)

- [ ] **Create LinkedIn Developer App**
  - Visit: https://www.linkedin.com/developers/apps
  - Create new app with name "User Ninjas Tester Auth"
  - Get Client ID and Client Secret

- [ ] **Configure Redirect URL in LinkedIn**
  - In LinkedIn app Auth settings
  - Add redirect URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=linkedin_oidc`
  - (Replace YOUR_PROJECT_ID with your actual Supabase project ID)

- [ ] **Enable LinkedIn in Supabase**
  - Go to: Supabase Dashboard > Authentication > Providers
  - Find "LinkedIn OIDC"
  - Toggle ON
  - Paste Client ID and Client Secret
  - Click Save

- [ ] **Test LinkedIn Sign-In**
  - Go to http://localhost:8082/auth
  - Select "Tester" role
  - Click "LinkedIn" button
  - Verify you're redirected to LinkedIn login

---

## 🔵 Google OAuth Setup (Recruiters)

- [ ] **Create Google Cloud Project**
  - Visit: https://console.cloud.google.com/
  - Create new project "User Ninjas Recruiter Auth"
  - Enable Google+ API

- [ ] **Create OAuth Credentials**
  - Go to: APIs & Services > Credentials
  - Create OAuth 2.0 Client ID (Web application)
  - Get Client ID and Client Secret

- [ ] **Configure Redirect URLs in Google**
  - Add JavaScript origin: `https://YOUR_PROJECT_ID.supabase.co`
  - Add redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=google`

- [ ] **Enable Google in Supabase**
  - Go to: Supabase Dashboard > Authentication > Providers
  - Find "Google"
  - Toggle ON
  - Paste Client ID and Client Secret
  - Click Save

- [ ] **Test Google Sign-In**
  - Go to http://localhost:8082/auth
  - Select "Recruiter" role
  - Click "Google" button
  - Verify you're redirected to Google login

---

## 🔵 Production Domain Setup

- [ ] **Update redirect URLs for production**
  - Replace `YOUR_PROJECT_ID.supabase.co` with your production domain
  - LinkedIn: Update redirect URL with production domain
  - Google: Update redirect URLs with production domain

- [ ] **Update environment variables**
  - In production: `VITE_APP_DOMAIN=https://www.userninjas.in`
  - In development: `VITE_APP_DOMAIN=http://localhost:8082`

---

## 🔵 Database Verification

- [ ] **Check profiles table has OAuth columns**
  - `auth_provider` (text)
  - `linkedin_verified` (boolean)
  - `google_verified` (boolean)
  - `company_email` (boolean)

- [ ] **Check user_roles table exists**
  - Should have `user_id` and `role` columns

---

## 🟡 Troubleshooting

### Error: "Unsupported provider: provider is not enabled"

**Fix:**
1. Go to Supabase Dashboard > Authentication > Providers
2. Make sure provider toggle is ON (blue)
3. Save the configuration
4. Reload the page

### Error: "Redirect URI mismatch"

**Fix:**
1. Get your Supabase Project ID from Settings
2. Make sure redirect URL is exactly: `https://PROJECT_ID.supabase.co/auth/v1/callback?provider=linkedin_oidc` or `?provider=google`
3. No typos or extra spaces

### Error: "Invalid Client ID"

**Fix:**
1. Double-check credentials are from the correct provider
2. Make sure you copied the entire ID (no extra characters)
3. Regenerate credentials if needed

---

## ✅ Success Indicators

After setup is complete, you should see:

- ✅ LinkedIn button appears for testers (when selected)
- ✅ Google button appears for recruiters (when selected)
- ✅ Clicking buttons redirects to provider login
- ✅ After login, user is redirected to dashboard
- ✅ Profile is created with user data

---

## 📝 Your Supabase Project Info

**Project ID**: Found in Supabase Settings > General

**Project URL**: `https://[PROJECT_ID].supabase.co`

**Find these values in your Supabase project and use them above.**

---

## 🆘 Need Help?

See detailed instructions in: `OAUTH_PROVIDER_SETUP.md`

For support: Check browser console (F12) for error messages.
