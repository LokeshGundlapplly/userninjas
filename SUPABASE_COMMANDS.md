# 🔧 Supabase Connection - Quick Commands Reference

## ⚡ Quick Start (Copy & Paste)

### 1. Verify Configuration
```bash
cd /Users/lokeshgundlapplly/userninjas-3
chmod +x verify-supabase.sh
./verify-supabase.sh
```

### 2. Check Environment Variables
```bash
grep VITE_SUPABASE .env
```

Expected output:
```
VITE_SUPABASE_PROJECT_ID="itkmsjqiaphxwwekevqp"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
VITE_SUPABASE_URL="https://itkmsjqiaphxwwekevqp.supabase.co"
```

### 3. Start Development Server
```bash
npm run dev
```

Expected output:
```
VITE v5.4.19 ready in XXX ms
➜ Local: http://localhost:8080/
```

---

## 🌐 Browser Console Commands (F12)

### Test 1: Check Client Initialization
```javascript
import { supabase } from '@/integrations/supabase/client';
console.log('URL:', supabase.supabaseUrl);
console.log('Expected: https://itkmsjqiaphxwwekevqp.supabase.co');
```

### Test 2: Query Database
```javascript
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log(error ? '❌ ' + error.message : '✅ Connected! Rows: ' + data?.length);
```

### Test 3: Check Authentication Status
```javascript
import { supabase } from '@/integrations/supabase/client';
const { data: { user } } = await supabase.auth.getUser();
console.log(user ? '✅ Logged in: ' + user.email : '⚪ Not logged in');
```

### Test 4: Run All Tests (Copy Entire Block)
```javascript
import { supabase } from '@/integrations/supabase/client';

async function fullTest() {
  console.group('🧪 Supabase Full Test');
  try {
    // Test 1: Client
    console.log('✓ Client URL:', supabase.supabaseUrl);
    
    // Test 2: Session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('✓ Session:', session ? 'Logged in' : 'Not logged in');
    
    // Test 3: Database - profiles
    const { data: profiles, error: err1 } = await supabase.from('profiles').select('*').limit(1);
    if (err1) throw err1;
    console.log('✓ Profiles table:', profiles?.length || 0, 'records');
    
    // Test 4: Database - user_roles
    const { data: roles, error: err2 } = await supabase.from('user_roles').select('*').limit(1);
    if (err2) throw err2;
    console.log('✓ User_roles table:', roles?.length || 0, 'records');
    
    // Test 5: Database - tests
    const { data: tests, error: err3 } = await supabase.from('tests').select('*').limit(1);
    if (err3) throw err3;
    console.log('✓ Tests table:', tests?.length || 0, 'records');
    
    console.log('\n✅ ALL TESTS PASSED!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    console.groupEnd();
  }
}

fullTest();
```

---

## 🔍 Verification Commands

### Check .env File
```bash
# Show Supabase config only
cat .env | grep VITE_SUPABASE

# Show all env vars
cat .env

# Check specific variable
echo $VITE_SUPABASE_PROJECT_ID
```

### Check Supabase Config
```bash
# Show project ID from config.toml
grep "project_id" supabase/config.toml

# Show auth settings
grep -A 20 "\[auth\]" supabase/config.toml

# Show email template subjects
grep "subject =" supabase/config.toml
```

### Check Node Modules
```bash
# List installed packages
npm list @supabase/supabase-js

# Show all dependencies
npm list --depth=0

# Reinstall if needed
npm install
```

### Check Key Files
```bash
# Verify Supabase client file
ls -la src/integrations/supabase/

# Verify auth hook
ls -la src/hooks/useAuth.tsx

# Verify email templates
ls -la supabase/templates/
```

---

## 🚀 Complete Verification Sequence

Run these commands in order:

```bash
# 1. Navigate to project
cd /Users/lokeshgundlapplly/userninjas-3

# 2. Check environment
echo "=== Node & npm ===" && node -v && npm -v

# 3. Verify configuration
echo "=== Supabase Config ===" && ./verify-supabase.sh

# 4. Install dependencies (if needed)
npm install

# 5. Start dev server
npm run dev

# (Then open http://localhost:8080 and run browser console tests)
```

---

## ✅ Expected Results

### Successful Connection:
```
✅ Project ID: itkmsjqiaphxwwekevqp
✅ URL: https://itkmsjqiaphxwwekevqp.supabase.co
✅ Client initialized
✅ Database queries working
✅ All tests passed
```

### Connection Failed:
```
❌ fetch failed
❌ invalid API key
❌ timeout
❌ connection refused
```

---

## 🆘 Troubleshooting

### If Configuration is Wrong:
```bash
# Check current .env
cat .env

# If Project ID is wrong, fix it:
sed -i '' 's/VITE_SUPABASE_PROJECT_ID=.*/VITE_SUPABASE_PROJECT_ID="itkmsjqiaphxwwekevqp"/g' .env
sed -i '' 's|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL="https://itkmsjqiaphxwwekevqp.supabase.co"|g' .env

# Verify fix
grep VITE_SUPABASE .env
```

### If Dependencies Missing:
```bash
npm install
```

### If Server Won't Start:
```bash
# Kill any existing server
pkill -f "npm run dev"

# Clear cache and restart
rm -rf .vite
npm run dev
```

### If Browser Shows Connection Error:
```bash
# Clear browser cache: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
# Then refresh page: Cmd+R or Ctrl+R
# Check DevTools Network tab for failed requests
```

---

## 📞 Connection Status Indicators

### ✅ Working:
- HTTP 200 responses from supabase.co domain
- Session data returned from auth queries
- Database rows returned from select queries
- No CORS errors in console

### ❌ Not Working:
- HTTP 4xx or 5xx errors
- "fetch failed" messages
- Empty responses from queries
- "unauthorized" or "invalid API key" errors
- CORS policy violations

---

## 🎯 Daily Workflow Commands

```bash
# 1. Start development (one command)
npm run dev

# 2. In browser console, run quick test
window.testSupabaseConnection?.() || console.log('Run: import { supabase } from "@/integrations/supabase/client"; const { data, error } = await supabase.from("profiles").select("*").limit(1); console.log(error ? "❌ " + error.message : "✅ Connected!");')

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## 📚 Reference Links

- **Supabase Dashboard:** https://app.supabase.com
- **Your Project:** https://app.supabase.com/project/itkmsjqiaphxwwekevqp
- **Local App:** http://localhost:8080
- **Supabase Docs:** https://supabase.com/docs

---

**Keep this file handy for quick reference! 🚀**
