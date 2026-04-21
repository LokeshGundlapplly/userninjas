# Quick Fix: Email Sending Error

## ⚡ 1-Minute Solution

### The Problem
Signup is failing with "error sending confirmation email"

### The Fix
Your Supabase project doesn't have SMTP configured to actually send emails.

### Step-by-Step Fix

**Step 1:** Go to https://supabase.com/dashboard/project/jpclnzgouzyroebjvcqp

**Step 2:** Click **Project Settings** (bottom left) → **Authentication**

**Step 3:** Scroll to **SMTP Settings**

**Step 4:** Choose ONE option below:

#### ✅ OPTION A: Supabase Built-in Email (EASIEST)
Nothing to do! It's usually enabled by default.
- Look for toggle labeled "Use Supabase's email service"
- Make sure it's **ON**
- Done! Emails should now work

#### ✅ OPTION B: SendGrid (FREE TIER AVAILABLE)
1. Sign up: https://sendgrid.com
2. Get API key from Settings → API Keys
3. Back in Supabase, fill in:
   - **SMTP Host:** `smtp.sendgrid.net`
   - **Port:** `587`
   - **Username:** `apikey`
   - **Password:** `<Paste your SendGrid API key>`
   - **Sender Email:** `noreply@userninjas.in`
   - **Sender Name:** `User Ninjas`
4. Click "Send test email" → should arrive in seconds
5. If it works, click "Save"

#### ✅ OPTION C: Resend (FREE TIER AVAILABLE) 
1. Sign up: https://resend.com
2. Get API key from Settings
3. Back in Supabase, fill in:
   - **SMTP Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** `<Paste your Resend API key>`
   - **Sender Email:** `onboarding@resend.dev`
   - **Sender Name:** `User Ninjas`
4. Click "Send test email" → should arrive in seconds
5. If it works, click "Save"

**Step 5:** Try signing up again!

---

## 🔍 If emails STILL don't arrive:

### Check 1: Did confirmation email arrive?
- Check your **Spam** folder
- Check your **Inbox**
- Wait 30 seconds and check again

### Check 2: Verify SMTP test email works
- In Supabase → SMTP Settings
- Click "Send test email"
- Did YOU receive it? (on your personal email)
- If NO: SMTP config is wrong, check credentials again
- If YES: SMTP works, but Supabase signup might be misconfigured

### Check 3: Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** (bottom left sidebar)
3. Look for **"auth"** tab or filter
4. Look for errors that say:
   - "SMTP connection failed"
   - "Invalid credentials"
   - "Email service unavailable"
5. Share these errors to diagnose

### Check 4: Verify Your Email Templates
1. Go to Supabase Dashboard
2. Project Settings → **Authentication** → **Email Templates**
3. Make sure these are **ENABLED**:
   - ✅ Confirm signup email
   - ✅ Invite user email
   - ✅ Recovery email (password reset)

---

## 📊 Expected Behavior After Fix

✅ User signs up with email
✅ Confirmation email arrives within 10 seconds
✅ User clicks confirmation link
✅ Email is confirmed
✅ User can now login with OTP verification

---

## 🆘 Still Having Issues?

**Most common reasons emails don't send:**

1. ❌ SMTP not configured at all → **Fix:** Choose option A, B, or C above
2. ❌ Wrong API key/credentials → **Fix:** Copy-paste from provider again
3. ❌ Email provider account not verified → **Fix:** Verify your account with provider
4. ❌ Sender email not verified → **Fix:** Some providers require sender email verification
5. ❌ Rate limited by provider → **Fix:** Wait 5 minutes, try again

---

## ✅ Verification Checklist

After configuring SMTP, verify it works:

- [ ] Go to Supabase SMTP settings
- [ ] Click "Send test email"
- [ ] Check your inbox for test email
- [ ] Email arrived? YES → Go to next step
- [ ] Email arrived? NO → Fix credentials above
- [ ] Try signup on your app
- [ ] Confirmation email arrived? YES → ✅ FIXED!
- [ ] Confirmation email arrived? NO → Check spam folder

---

## 📞 Quick Support

**Email Provider Support Links:**
- SendGrid: https://support.sendgrid.com
- Resend: https://resend.com/docs
- Supabase: https://supabase.com/docs/guides/auth

**Documentation:**
- Full setup: See EMAIL_SETUP.md
- Architecture: See IMPLEMENTATION_SUMMARY.md
