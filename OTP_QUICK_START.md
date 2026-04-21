# ⚡ Quick Start - OTP Authentication

## 🎯 What You Need to Do

Your app already has OTP sign-in and password reset implemented! Here's how to activate it:

---

## Step 1️⃣: Get Resend API Key

**Why?** To send OTP codes and password reset emails

1. Go to https://resend.com
2. Sign up or log in
3. Go to Settings → API Keys
4. Copy your API key (starts with `re_`)

---

## Step 2️⃣: Deploy Edge Functions

**Why?** These send OTP codes and verify them

```bash
cd /Users/lokeshgundlapplly/userninjas-3

# Deploy both functions
supabase functions deploy send-login-otp
supabase functions deploy verify-login-otp

# Verify they deployed
supabase functions list
```

You should see both functions listed. ✅

---

## Step 3️⃣: Set Environment Secret

**Why?** Edge functions need your Resend API key

1. Go to **Supabase Dashboard** → Your project
2. Click **Project Settings** (bottom left)
3. Go to **Functions** → **Secrets**
4. Click **New secret**
5. Name: `RESEND_API_KEY`
6. Value: Paste your Resend API key from Step 1
7. Click **Add secret**

---

## Step 4️⃣: Verify Your .env File

```bash
# Check what's in .env
grep "VITE_SUPABASE" /Users/lokeshgundlapplly/userninjas-3/.env
```

Should look like:
```
VITE_SUPABASE_URL=https://jpclnzgouzyroebjvcqp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... (starts with eyJ)
```

⚠️ **IMPORTANT:** If `VITE_SUPABASE_PUBLISHABLE_KEY` starts with `sb_publishable_`, it's wrong!
- You need the JWT anon key, not the management token
- Go to Supabase Dashboard → Settings → API → Copy the "anon public key"

---

## Step 5️⃣: Start Your App

```bash
cd /Users/lokeshgundlapplly/userninjas-3
npm run dev
```

Open: http://localhost:8080/auth

---

## Step 6️⃣: Test OTP Sign-In

**First time setup:**

1. If you don't have an account, click "Create account"
   - Select "Tester" or "Recruiter"
   - Fill in name, email, password
   - Click "Create account"
   - Confirm email if prompted

2. Once you have an account, click "Sign In"
   - Email: Your email
   - Password: Your password
   - Click "Sign In"

3. You should see: **"Verification code sent"**

4. Check your email for the 6-digit code

5. Enter the code on the form

6. 🎉 You're signed in! Redirected to your dashboard

---

## Step 7️⃣: Test Password Reset

1. Go to http://localhost:8080/auth
2. Click "Forgot password?"
3. Enter your email
4. You should see: **"Check your email"**
5. Open your email and click the reset link
6. Enter new password (min 6 characters)
7. Confirm password
8. Click "Update Password"
9. You're redirected to sign in
10. Sign in with new password + OTP code ✅

---

## 🔍 Debugging

### OTP not sending?

**Check 1:** Resend API key is set in Supabase
```
Supabase Dashboard → Project Settings → Functions → Secrets
```
Should see `RESEND_API_KEY` listed.

**Check 2:** Edge functions deployed
```bash
supabase functions list
```
Should see both `send-login-otp` and `verify-login-otp`.

**Check 3:** Browser console for errors
```
Press F12 → Console tab → Look for red errors
```

**Check 4:** Run verification script
```bash
cd /Users/lokeshgundlapplly/userninjas-3
./verify-otp-setup.sh
```

### Email not arriving?

- Check spam folder
- Verify email address is correct
- Check Resend account has enough credits
- Check email domain in Resend is verified

### Reset link not working?

- Make sure you click the exact link in the email
- Don't copy-paste, click directly
- Check that your browser is on http://localhost:8080 (not production)
- If link expired, request a new one

---

## 📝 What's Happening Behind the Scenes

### OTP Sign-In
```
1. User enters email + password
2. Backend verifies credentials
3. Edge function generates random 6-digit code
4. Code stored in database (10-min expiry)
5. Resend API sends email
6. User enters code
7. Edge function validates code
8. ✅ User logged in
```

### Password Reset
```
1. User enters email
2. Supabase generates reset token
3. Email sent with reset link
4. User clicks link → /reset-password?token=xxx
5. Supabase validates token
6. User sets new password
7. Password updated in database
8. ✅ User can sign in with new password
```

---

## 📚 Full Documentation

See **`OTP_AUTH_GUIDE.md`** for:
- Complete architecture overview
- File-by-file breakdown
- Database schema details
- Testing checklist
- Security considerations
- Production deployment guide
- Troubleshooting
- Command reference

---

## ✨ What You Get

✅ **OTP-based sign-in** (secure 2FA)
✅ **Password recovery** (reset via email)
✅ **Professional emails** (branded with User Ninjas logo)
✅ **Error handling** (user-friendly messages)
✅ **Role-based access** (Tester/Recruiter/Admin)
✅ **Session management** (auto redirect based on role)
✅ **Production-ready** (follows security best practices)

---

## 🚀 You're Ready!

1. ✅ Get Resend API key (done? → Step 1)
2. ✅ Deploy edge functions (done? → Step 2)
3. ✅ Set RESEND_API_KEY secret (done? → Step 3)
4. ✅ Check .env file (done? → Step 4)
5. ✅ npm run dev (done? → Step 5)
6. ✅ Test OTP sign-in (done? → Step 6)
7. ✅ Test password reset (done? → Step 7)

**That's it! Your authentication system is live!** 🎉

---

## 💬 Questions?

Refer to:
- `OTP_AUTH_GUIDE.md` - Full technical documentation
- `verify-otp-setup.sh` - Configuration verification script
- Supabase docs: https://supabase.com/docs/guides/auth
- Resend docs: https://resend.com/docs

Happy building! 🥷
