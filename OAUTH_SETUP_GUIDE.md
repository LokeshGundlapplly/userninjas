# OAuth Configuration Guide

## Setup Instructions for LinkedIn and Google OAuth

This guide explains how to configure LinkedIn and Google OAuth providers in your Supabase project.

## Prerequisites

- Access to Supabase project dashboard
- LinkedIn Developer Account
- Google Cloud Project

---

## 1. LinkedIn OAuth Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the form:
   - **App name**: User Ninjas
   - **LinkedIn Page**: Select or create a LinkedIn page for your company
   - **App logo**: Upload a logo
   - **Legal agreement**: Accept and continue

### Step 2: Get Credentials

1. Go to your app's "Auth" tab
2. Copy the following:
   - **Client ID**
   - **Client Secret**

### Step 3: Set Authorized Redirect URLs

1. In the "Auth" tab, under "Authorized redirect URLs"
2. Add your Supabase callback URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=linkedin_oidc
   ```
   Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### Step 4: Configure in Supabase

1. Go to Supabase Dashboard > Authentication > Providers
2. Find and enable "LinkedIn OIDC"
3. Paste your Client ID and Client Secret
4. Save

---

## 2. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "User Ninjas"
3. Enable the Google+ API

### Step 2: Create OAuth Credentials

1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Under "Authorized JavaScript origins", add:
   ```
   https://YOUR_PROJECT_ID.supabase.co
   ```
5. Under "Authorized redirect URIs", add:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=google
   ```
6. Click "Create"
7. Copy your **Client ID** and **Client Secret**

### Step 3: Configure in Supabase

1. Go to Supabase Dashboard > Authentication > Providers
2. Find and enable "Google"
3. Paste your Client ID and Client Secret
4. Save

---

## 3. Configure Redirect URLs in App

The app uses the following redirect URL:
```
https://www.userninjas.in/auth/callback
```

This is configured in the environment variable:
```
VITE_APP_DOMAIN=https://www.userninjas.in
```

---

## 4. User Experience Flow

### Tester Sign-In with LinkedIn

1. Tester clicks "Sign in with LinkedIn"
2. Redirected to LinkedIn login
3. LinkedIn redirects back to `/auth/callback`
4. App verifies session and marks tester as `linkedin_verified`
5. Redirects to tester dashboard

### Recruiter Sign-In with Google

1. Recruiter clicks "Sign in with Google"
2. Company email is validated (must not be personal email like Gmail)
3. Redirected to Google login
4. Google redirects back to `/auth/callback`
5. App verifies session and marks recruiter as `google_verified`
6. Redirects to recruiter dashboard

---

## 5. Database Schema

The following fields track OAuth authentication in the `profiles` table:

```sql
- auth_provider (text): The provider used ('email', 'linkedin_oidc', 'google')
- linkedin_verified (boolean): True if user authenticated via LinkedIn
- google_verified (boolean): True if user authenticated via Google
- company_email (boolean): True if recruiter used company email
```

---

## 6. Company Email Validation (Recruiters Only)

Recruiters must use company emails. The app validates against:

- A whitelist of known company domains (Google, Microsoft, Apple, etc.)
- Rejection of common free email providers (Gmail, Yahoo, Outlook, etc.)

To add a company domain to the whitelist, update:
```
src/utils/emailValidation.ts
```

Add the domain to `ALLOWED_COMPANY_DOMAINS` array.

---

## 7. Troubleshooting

### Redirect URL Mismatch

**Error**: "Redirect URI mismatch"
- Make sure the redirect URL in OAuth provider settings exactly matches:
  ```
  https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=linkedin_oidc
  ```

### Missing Scopes

**Error**: "Insufficient permissions"
- LinkedIn: Ensure app has permission to access email
- Google: Ensure `profile` and `email` scopes are enabled

### Recruiter Company Email Rejected

**Issue**: Company domain not recognized
- Add domain to `ALLOWED_COMPANY_DOMAINS` in `src/utils/emailValidation.ts`
- Or request it be added by the admin

---

## 8. Testing OAuth Flow Locally

1. Update your local `.env` to use production domain:
   ```
   VITE_APP_DOMAIN=https://www.userninjas.in
   ```

2. Use a tunnel tool like ngrok to expose localhost:
   ```
   ngrok http 8082
   ```

3. Add the ngrok URL to OAuth provider's redirect URLs

4. Navigate to the ngrok URL to test the OAuth flow

---

## Security Notes

- OAuth tokens are stored securely in Supabase auth session
- Client secrets should never be exposed in frontend code
- Always use HTTPS in production
- Regularly rotate OAuth credentials
- Monitor OAuth logs for suspicious activity
