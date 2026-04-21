# OAuth Provider Setup - Complete Guide

## Error: "Unsupported provider: provider is not enabled"

This error occurs when OAuth providers aren't configured in Supabase. Follow these steps to enable LinkedIn and Google OAuth.

---

## Prerequisites

- Access to your Supabase project dashboard
- LinkedIn Developer account (for LinkedIn OAuth)
- Google Cloud Project (for Google OAuth)

---

## Part 1: LinkedIn OAuth Setup (For Testers)

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in the form:
   - **App name**: `User Ninjas Tester Auth`
   - **LinkedIn Page**: Select or create your company page
   - **App logo**: Upload a logo
   - Accept the terms and create

### Step 2: Get LinkedIn Credentials

1. Go to your app's **"Auth"** tab
2. Under **"Credentials"**, copy:
   - **Client ID**
   - **Client Secret**

### Step 3: Set LinkedIn Redirect URL

1. In the **"Auth"** tab, find **"Authorized redirect URLs for your app"**
2. Click **"Add redirect URL"**
3. Add this URL (replace `YOUR_PROJECT_ID`):
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=linkedin_oidc
   ```
   
   **Find your Project ID:**
   - Go to Supabase Dashboard > Settings > General
   - Copy the Project ID from the URL or settings

### Step 4: Configure LinkedIn in Supabase

1. Go to **Supabase Dashboard > Authentication > Providers**
2. Find **"LinkedIn OIDC"** and click it
3. Toggle **"Enable Sign-in with LinkedIn OIDC"** to ON
4. Paste:
   - **Client ID**: Your LinkedIn Client ID
   - **Client Secret**: Your LinkedIn Client Secret
5. Click **"Save"**

---

## Part 2: Google OAuth Setup (For Recruiters)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"NEW PROJECT"**
4. Name it: `User Ninjas Recruiter Auth`
5. Click **"Create"**
6. Wait for the project to be created

### Step 2: Enable Google+ API

1. In Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for **"Google+ API"**
3. Click on it
4. Click **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - Choose **"External"** for user type
   - Fill in required fields (app name, support email, etc.)
   - Click **"Create"**
4. Back to credentials, click **"Create Credentials"** > **"OAuth client ID"** again
5. Choose **"Web application"**
6. Under **"Authorized JavaScript origins"**, click **"Add URI"** and add:
   ```
   https://YOUR_PROJECT_ID.supabase.co
   ```
7. Under **"Authorized redirect URIs"**, click **"Add URI"** and add:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=google
   ```
8. Click **"Create"**
9. Copy your:
   - **Client ID**
   - **Client Secret**

### Step 4: Configure Google in Supabase

1. Go to **Supabase Dashboard > Authentication > Providers**
2. Find **"Google"** and click it
3. Toggle **"Enable Sign-in with Google"** to ON
4. Paste:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
5. Click **"Save"**

---

## Part 3: Update Your App Configuration

### Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_JWT_ANON_KEY
VITE_APP_DOMAIN=https://www.userninjas.in
```

For local development, you can use:
```env
VITE_APP_DOMAIN=http://localhost:8082
```

---

## Part 4: Test the Setup

### Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:8082/auth`

3. For **Testers**:
   - Click on the Tester role
   - You should see a **LinkedIn button**
   - Click it to test

4. For **Recruiters**:
   - Click on the Recruiter role
   - You should see a **Google button**
   - Click it to test

### Expected Flow

1. Click LinkedIn/Google button
2. Redirected to provider login page
3. Log in with your account
4. Redirected back to `/auth/callback`
5. Profile is created/updated
6. Redirected to dashboard

---

## Troubleshooting

### Error: "Redirect URI mismatch"

**Problem**: The redirect URL doesn't match between your app and Supabase

**Solution**:
- Make sure the redirect URL exactly matches
- Include `?provider=linkedin_oidc` for LinkedIn
- Include `?provider=google` for Google
- Your Project ID must be correct

### Error: "Invalid Client ID"

**Problem**: Wrong credentials pasted in Supabase

**Solution**:
- Double-check the Client ID and Secret
- Make sure they're from the correct provider
- No extra spaces when copying

### Error: "Provider not enabled"

**Problem**: Provider toggle is still OFF in Supabase

**Solution**:
- Go to Authentication > Providers
- Make sure the toggle is ON (blue)
- Save the configuration

### Buttons Not Showing

**Problem**: OAuth buttons aren't visible on auth page

**Solution**:
- Make sure you selected the correct role (Tester for LinkedIn, Recruiter for Google)
- Refresh the page
- Check browser console for errors (F12)

---

## After Setup: What Gets Saved

When a user signs in with OAuth, the following data is automatically saved:

**In Supabase `profiles` table:**
```
- full_name: User's name from OAuth provider
- email: User's email
- auth_provider: 'linkedin_oidc' or 'google'
- linkedin_verified: true (if LinkedIn)
- google_verified: true (if Google)
- company_email: true (if Google recruiter)
- created_at: Timestamp
- updated_at: Timestamp
```

**In Supabase `user_roles` table:**
```
- user_id: Unique identifier
- role: 'tester' (for LinkedIn) or 'recruiter' (for Google)
```

---

## Security Notes

✅ Never expose Client Secrets in your frontend code
✅ OAuth tokens are stored securely in Supabase
✅ All credentials are encrypted in transit (HTTPS only)
✅ Regularly rotate OAuth credentials in production

---

## Getting Help

If you still see errors after setup:

1. **Check Supabase logs**:
   - Supabase Dashboard > Auth > Users
   - Look for error messages in the activity logs

2. **Check browser console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages

3. **Verify configuration**:
   - Double-check Project ID
   - Verify redirect URLs are exact
   - Confirm provider toggles are ON
