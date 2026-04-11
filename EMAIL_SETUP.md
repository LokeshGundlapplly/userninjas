# Email Notification System — Setup Guide

## Status

| Component | Status |
|---|---|
| `send-email` edge function | ✅ Deployed |
| `send-review-notification` edge function | ✅ Redeployed (sender updated) |
| Frontend email hooks (useAuth, CreateTest, RecruiterDashboard, TesterDashboard) | ✅ Wired |
| `RESEND_API_KEY` secret | ✅ Set |
| Supabase Auth custom SMTP | ❌ **Manual dashboard config needed** |
| Auth email templates | ✅ Created in `supabase/templates/` |

---

## Step 1: Set Resend API Key

Run this command (replace `re_xxxx` with your actual Resend API key):

```bash
supabase secrets set RESEND_API_KEY=re_8tNfLrRy_MGgp919bEuk8vbLhB1TJMCz4
```

Without this, all emails will fail with "RESEND_API_KEY is not configured".

---

## Step 2: Configure Supabase Auth Custom SMTP

This makes Supabase's **built-in auth emails** (email verification, password reset, magic links) come from `support@userninjas.in` instead of the default `noreply@mail.app.supabase.io`.

1. Go to: **Supabase Dashboard → Project Settings → Authentication → SMTP Settings**
2. Toggle **Enable Custom SMTP** ON
3. Enter:
   - **Sender email**: `support@userninjas.in`
   - **Sender name**: `User Ninjas`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **Username**: `resend`
   - **Password**: Your Resend API key (`re_xxxx...`)

4. Click **Save**

### Customize Email Templates

All 6 branded HTML templates are in `supabase/templates/`. To apply them:

Go to **Supabase Dashboard → Authentication → Email Templates** and for each template type:
1. Set the **Subject** as shown below
2. Switch to **Source** mode in the body editor
3. Copy-paste the entire HTML from the corresponding file

| Template | Subject | File |
|---|---|---|
| **Confirm signup** | `Confirm your User Ninjas account 🥷` | `supabase/templates/confirmation.html` |
| **Invite user** | `You've been invited to User Ninjas 🥷` | `supabase/templates/invite.html` |
| **Magic link** | `Your User Ninjas sign-in link 🔗` | `supabase/templates/magic_link.html` |
| **Change email** | `Confirm your new email — User Ninjas` | `supabase/templates/email_change.html` |
| **Reset password** | `Reset your User Ninjas password` | `supabase/templates/recovery.html` |
| **Reauthentication** | `Verify your identity — User Ninjas` | `supabase/templates/reauthentication.html` |

---

## What Emails Are Sent

### Via `send-email` Edge Function (custom app emails)

| Event | Type | Recipient | Triggered From |
|---|---|---|---|
| User signs up | `welcome` | New user | `useAuth.tsx` (signup) |
| User signs in | `sign_in_alert` | Signed-in user | `useAuth.tsx` (login) |
| Recruiter creates test | `test_created` | Recruiter | `CreateTest.tsx`, `RecruiterDashboard.tsx` |
| Tester starts a test | `new_submission` | Recruiter (resolved from `recruiter_id`) | `TesterDashboard.tsx` |

### Via Supabase Auth (built-in, needs SMTP config above)

| Event | Template |
|---|---|
| Email verification on signup | Confirm signup |
| Password reset request | Reset password |
| Magic link login | Magic link |

### Via `send-review-notification` Edge Function

| Event | Recipient |
|---|---|
| Submission approved/rejected | Tester |

---

## Architecture

```
Frontend (React)
  ├─ useAuth.tsx → signup/signin → invoke send-email (welcome, sign_in_alert)
  ├─ CreateTest.tsx → test created → invoke send-email (test_created)
  ├─ RecruiterDashboard.tsx → quick test created → invoke send-email (test_created)
  └─ TesterDashboard.tsx → test started → invoke send-email (new_submission, to_user_id)
       └─ send-email resolves recruiter_id → email via auth.admin.getUserById()

Supabase Auth
  └─ SMTP → smtp.resend.com → support@userninjas.in
       Handles: verification, password reset, magic link

Edge Functions
  ├─ send-email (7 templates, supports to or to_user_id)
  └─ send-review-notification (review results to testers)
```

## Testing

After setting `RESEND_API_KEY`:

1. **Sign up** a new user → should receive welcome email
2. **Sign in** → should receive sign-in alert email
3. **Create a test** as recruiter → should receive test_created email
4. **Start a test** as tester → recruiter should receive new_submission email
5. **Verify email** on signup → should come from `support@userninjas.in` (after SMTP config)
