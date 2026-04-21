# Supabase Setup & Data Access Guide

## 🔧 Fixed Issues

✅ **Environment Variables Cleaned Up**
- Removed duplicate/conflicting SUPABASE_ keys
- Kept only the correct VITE_SUPABASE_* variables
- The app now uses the correct Supabase project: `itkmsjqiaphxwwekevqp`

✅ **Lovable Branding Removed**
- Removed from `index.html` (title, meta tags, og:image)
- Removed from `README.md` 
- Removed `lovable-tagger` from `vite.config.ts`
- All references replaced with User Ninjas branding

## 📊 Accessing Supabase Data

### Option 1: Supabase Dashboard (Web UI)

1. Go to https://supabase.com
2. Sign in with your account
3. Select your project: **"User Ninjas"** (ID: `itkmsjqiaphxwwekevqp`)
4. Navigate to "SQL Editor" or "Table Editor"
5. Available tables:
   - `profiles` - User profile information
   - `user_roles` - User role assignments (tester, recruiter, admin)
   - `tests` - Test configurations
   - `submissions` - User test submissions
   - `surveys` - Survey data
   - `ai_interview_sessions` - AI interview records

### Option 2: Using the Application

The app has role-based dashboards:
- **Tester Dashboard**: `/tester` - View available tests and submissions
- **Recruiter Dashboard**: `/recruiter` - Manage tests and view analytics
- **Admin Panel**: `/admin` - Administrative controls

### Option 3: Query via App Console

In your browser's developer console (F12), run:

```javascript
// Import the Supabase client
import { supabase } from '@/integrations/supabase/client';

// Fetch users
const { data: profiles, error: err1 } = await supabase
  .from('profiles')
  .select('*')
  .limit(10);
console.log('Profiles:', profiles);

// Fetch user roles
const { data: roles, error: err2 } = await supabase
  .from('user_roles')
  .select('*')
  .limit(10);
console.log('User Roles:', roles);

// Fetch tests
const { data: tests, error: err3 } = await supabase
  .from('tests')
  .select('*')
  .limit(10);
console.log('Tests:', tests);
```

## 🔗 Environment Configuration

Your `.env` file is now correctly configured:

```
VITE_SUPABASE_URL=https://itkmsjqiaphxwwekevqp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a21zanFpYXBoeHd3ZWtldnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzk1MjcsImV4cCI6MjA4MTYxNTUyN30.9Kz014GKuPTX6DreAR4w-mi8GCUsR9L-Mges44bBcfM
VITE_SUPABASE_PROJECT_ID=itkmsjqiaphxwwekevqp
```

## ✨ Features Updated

- **Branding**: Changed from "Lovable" to "User Ninjas" throughout
- **Meta Tags**: Updated HTML meta tags for SEO and social sharing
- **Config Files**: Cleaned up unnecessary Lovable dependencies

## 🚀 Next Steps

1. **Create Test Data**: Go to Supabase dashboard and add test records
2. **Verify Auth**: Try signing up/logging in to populate `profiles` and `user_roles`
3. **Run Tests**: Submit test responses to populate `submissions` table
4. **Monitor Logs**: Check Supabase "Logs" section for any API errors

## 🆘 Troubleshooting

### If you see "Connection Error"
- Check your internet connection
- Verify `VITE_SUPABASE_URL` matches the project URL in Supabase dashboard
- Clear browser cache and restart dev server

### If data doesn't show in dashboard
- Go to Supabase > Authentication > Users to verify users exist
- Check RLS (Row Level Security) policies if queries return empty results
- Review API logs in Supabase dashboard for detailed errors

### If auth fails
- Verify email templates are configured in `supabase/config.toml`
- Check email service settings in Supabase > Authentication > Providers
- Review signup function logs at `/supabase/functions/auth-signup/`

## 📚 Useful Links

- Supabase Project: https://app.supabase.com
- Supabase Docs: https://supabase.com/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
