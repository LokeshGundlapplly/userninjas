# 🔑 How to Get Your Correct Supabase Keys

## ❌ Wrong Key Format
```
sb_publishable_9ZzJz2DMLEawYKyzTHdhMw_knx2IdQ6
↑ This is a Personal Access Token (management key)
```

## ✅ Correct Key Format Needed
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6I...
↑ This is a JWT anon key (public key for app)
```

---

## 🔧 How to Get Your Correct Keys

### Step 1: Go to Supabase Dashboard
- Go to: https://app.supabase.com
- Log in with your account
- Select your project: **jpclnzgouzyroebjvcqp**

### Step 2: Find Your API Keys
1. In left sidebar, click: **Settings** → **API**
2. You'll see two keys under "Project API keys":
   - **Project URL** (copy this entire URL)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...` - keep this secret!)

### Step 3: Copy the Correct Values
```
✅ VITE_SUPABASE_URL = Your Project URL
   Example: https://jpclnzgouzyroebjvcqp.supabase.co

✅ VITE_SUPABASE_PUBLISHABLE_KEY = anon public key
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

---

## 📋 What You Should Have

Your `.env` file should look like:

```env
VITE_SUPABASE_PROJECT_ID=jpclnzgouzyroebjvcqp
VITE_SUPABASE_URL=https://jpclnzgouzyroebjvcqp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**NOT:**
```env
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_9ZzJz2DMLEawYKyzTHdhMw_knx2IdQ6  ❌ WRONG
```

---

## 🎯 Quick Fix Steps

1. **Open Supabase Dashboard**: https://app.supabase.com/project/jpclnzgouzyroebjvcqp

2. **Go to Settings → API**

3. **Copy the "anon public key"** (looks like: `eyJhbGc...`)

4. **Replace in .env file:**
   ```bash
   # In terminal:
   nano .env
   
   # Find this line:
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   
   # Replace with the JWT key you copied
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   
   # Save: Ctrl+O, Enter, Ctrl+X
   ```

5. **Restart dev server:**
   ```bash
   npm run dev
   ```

6. **Test in browser console (F12):**
   ```javascript
   import { supabase } from '@/integrations/supabase/client';
   const { data, error } = await supabase.from('profiles').select('*').limit(1);
   console.log(error ? '❌ ' + error.message : '✅ Connected!');
   ```

---

## 🔐 Key Types Explained

| Key Type | Format | Usage | Security |
|----------|--------|-------|----------|
| **anon key** | `eyJhbGc...` | Browser/Frontend | ✅ Public (safe to expose) |
| **service_role key** | `eyJhbGc...` | Server/Backend | 🔒 Private (keep secret!) |
| **Personal Access Token** | `sb_...` | Admin/Management | 🔒 Private (keep secret!) |

**Your frontend needs:** `anon key` (starting with `eyJ...`)

---

## 🚀 After You Update the Key

1. Update `.env` with correct anon key
2. Save the file
3. Restart dev server: `npm run dev`
4. Test connection in browser console

**Result should be:** `✅ Connected!`

---

## ❓ Not Sure Which Key Is Correct?

Look for these in Supabase Dashboard (Settings → API):

```
Project URL:
https://jpclnzgouzyroebjvcqp.supabase.co   ← This is your URL

anon public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← This is what you need
(much longer than sb_publishable_...)

service_role key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← DON'T use this in frontend
(keep this secret - for backend only)
```

**Copy the "anon public key" to your `.env` file!**
