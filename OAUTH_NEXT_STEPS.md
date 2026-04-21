# 🚀 OAuth Setup - Next Steps

## What You're Seeing

The error you're seeing:
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

**This means:** LinkedIn and Google OAuth haven't been configured in your Supabase project yet.

---

## What Just Got Implemented ✅

1. **Profile Completion Page** - After OAuth login, users complete their profile
2. **Better Error Messages** - Clear explanations when OAuth isn't set up
3. **Profile Data Saving** - All user details are saved to Supabase
4. **Setup Documentation** - Complete guides and checklists

---

## Your To-Do List 📋

### Quick Setup (15-20 minutes)

Follow this order:

#### Step 1: Create LinkedIn Developer App (5 min)
- Go to: https://www.linkedin.com/developers/apps
- Create app → Get Client ID & Secret
- Add redirect URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=linkedin_oidc`

#### Step 2: Create Google Cloud Project (5 min)
- Go to: https://console.cloud.google.com/
- Create project → Enable Google+ API
- Create OAuth 2.0 credentials → Get Client ID & Secret
- Add redirect URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=google`

#### Step 3: Configure in Supabase (3 min)
- Go to: Supabase Dashboard > Authentication > Providers
- Enable LinkedIn OIDC → Paste credentials → Save
- Enable Google → Paste credentials → Save

#### Step 4: Test (2 min)
- Go to: http://localhost:8082/auth
- Try signing in with LinkedIn (as Tester)
- Try signing in with Google (as Recruiter)

---

## Important: Find Your Supabase Project ID

You'll need this for redirect URLs:

1. Go to Supabase Dashboard
2. Click Settings > General
3. Copy the **Project ID** from the URL or page

Example:
- Your URL: `https://jpclnzgouzyroebjvcqp.supabase.co`
- Your Project ID: `jpclnzgouzyroebjvcqp`

---

## Files to Reference

**Quick Checklist:**
- `OAUTH_SETUP_CHECKLIST.md` - Step-by-step checklist (5-10 min read)

**Detailed Guide:**
- `OAUTH_PROVIDER_SETUP.md` - Complete with screenshots and troubleshooting (10-15 min read)

---

## What Gets Saved When User Signs In

After setup, when a user signs in with LinkedIn or Google:

**In Supabase database:**
```
profiles table:
- full_name: User's name
- email: User's email  
- auth_provider: 'linkedin_oidc' or 'google'
- linkedin_verified: true (for LinkedIn)
- google_verified: true (for Google)
- company_email: true (for recruiter Google)
- phone, location, website, bio: (from profile completion)

user_roles table:
- user_id: Unique ID
- role: 'tester' (LinkedIn) or 'recruiter' (Google)
```

---

## Expected User Flow After Setup

### Tester with LinkedIn
1. Click "Sign in as Tester"
2. Click LinkedIn button
3. Redirected to LinkedIn login
4. After login → Redirected to `/auth/callback`
5. Shown profile completion form (optional)
6. Redirected to tester dashboard
7. Profile saved in Supabase ✅

### Recruiter with Google
1. Click "Sign in as Recruiter"
2. Click Google button
3. Must use company email (not Gmail)
4. Redirected to Google login
5. After login → Redirected to `/auth/callback`
6. Shown profile completion form (optional)
7. Redirected to recruiter dashboard
8. Profile saved in Supabase ✅

---

## Testing Locally Before Production

For local development, redirect URLs can be:
```
http://localhost:8082/auth/callback
```

Or use a tunnel tool like **ngrok**:
```bash
ngrok http 8082
# Use the ngrok URL as your redirect URL
```

---

## Verification Checklist

After setting up, verify:

- [ ] LinkedIn button shows for testers
- [ ] Google button shows for recruiters
- [ ] Clicking buttons redirects to provider
- [ ] No "provider is not enabled" error
- [ ] After login, users can complete profile
- [ ] Users redirected to correct dashboard
- [ ] Check Supabase `profiles` table - has new users
- [ ] Check Supabase `user_roles` table - has correct roles

---

## Common Issues & Fixes

### Issue: Still seeing "provider is not enabled"
**Fix:** 
- Make sure provider toggle is ON (blue) in Supabase
- Save the configuration
- Refresh the page
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Redirect URI mismatch"
**Fix:**
- Double-check Project ID is correct
- Make sure redirect URL is EXACT (no typos, no extra spaces)
- Include `?provider=linkedin_oidc` or `?provider=google`

### Issue: "Invalid Client ID"
**Fix:**
- Verify credentials are from correct provider
- Copy entire ID (no partial copy)
- Try regenerating credentials

---

## Deployed to Production

Your code is deployed to git with:
- ✅ OAuth handlers with better error messages
- ✅ Profile completion page
- ✅ Profile data saving to Supabase
- ✅ Setup documentation
- ✅ Zero TypeScript errors

---

## Next: You Need To

1. **Get LinkedIn OAuth credentials** (5 min)
2. **Get Google OAuth credentials** (5 min)
3. **Enable both providers in Supabase** (3 min)
4. **Test the flow** (2 min)

**Total time: ~15 minutes**

---

## Ready?

Start with `OAUTH_SETUP_CHECKLIST.md` and follow the steps!

Questions? Check `OAUTH_PROVIDER_SETUP.md` for detailed instructions.
