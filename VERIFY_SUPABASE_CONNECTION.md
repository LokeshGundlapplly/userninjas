# ✅ Supabase Connection Verification Checklist

## Quick Start - 3 Ways to Test

### **Method 1: Browser Console (Fastest) ⚡**

```javascript
// Copy-paste this in browser console (F12)
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log(error ? '❌ Error: ' + error.message : '✅ Connected! Data: ' + JSON.stringify(data));
```

**Expected Result:**
- ✅ `Connected! Data: [...]` = Success
- ❌ `Error: ...` = Check troubleshooting below

---

### **Method 2: Use the Test Component**

1. Import in any page:
```tsx
import { SupabaseConnectionTester } from '@/components/SupabaseConnectionTester';

export default function TestPage() {
  return <SupabaseConnectionTester />;
}
```

2. Click "Test Connection" button
3. Check the result ✅ or ❌

---

### **Method 3: Run Test Utility**

In browser console:
```javascript
window.testSupabaseConnection().then(result => {
  console.log('Test result:', result);
});
```

---

## ✅ Full Connection Checklist

### 1. **Environment Variables Check**
```bash
# Run in terminal
cat /Users/lokeshgundlapplly/userninjas-3/.env
```

**Should contain:**
```
✓ VITE_SUPABASE_URL=https://itkmsjqiaphxwwekevqp.supabase.co
✓ VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
✓ VITE_SUPABASE_PROJECT_ID=itkmsjqiaphxwwekevqp
```

### 2. **Dev Server Running**
```bash
npm run dev
```

**Should show:**
```
✓ VITE v5.x.x ready in XXX ms
✓ ➜ Local: http://localhost:8080/
```

### 3. **Network Connection**
Open DevTools (F12) → Network tab → Refresh page

**Look for requests to:**
```
✓ https://itkmsjqiaphxwwekevqp.supabase.co/...
```

**Should have:**
- ✅ Status 200 (OK)
- ✅ Headers include `authorization: Bearer ...`

### 4. **Database Tables Accessible**

Try these queries in browser console:

```javascript
import { supabase } from '@/integrations/supabase/client';

// Test each table
const tables = ['profiles', 'user_roles', 'tests', 'submissions', 'surveys'];

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('*').limit(1);
  console.log(`${table}: ${error ? '❌ ' + error.message : '✅ OK'}`);
}
```

---

## 🔍 Detailed Diagnostics

### **Check Supabase Project Status**

1. Go to https://app.supabase.com
2. Select "User Ninjas" project
3. Check these indicators:
   - ✅ Project status = "Active" (green)
   - ✅ Database = "Online"
   - ✅ Auth = "Enabled"

### **Check API Health**

```javascript
// In browser console
const response = await fetch('https://itkmsjqiaphxwwekevqp.supabase.co/rest/v1/?apikey=YOUR_KEY');
console.log('API Status:', response.status, response.statusText);
```

### **Check Authentication**

```javascript
import { supabase } from '@/integrations/supabase/client';

const { data: { user }, error } = await supabase.auth.getUser();
console.log('Auth Status:', error ? error.message : (user ? 'Logged in' : 'Not logged in'));
```

---

## ❌ Troubleshooting

### **Issue: "Network Error" or "CORS Error"**

**Solution:**
1. Check VITE_SUPABASE_URL matches: `https://itkmsjqiaphxwwekevqp.supabase.co`
2. Restart dev server: `npm run dev`
3. Clear cache: `Cmd+Shift+Delete`
4. Try private/incognito window

### **Issue: "Invalid API Key"**

**Solution:**
1. Go to Supabase dashboard
2. Settings → API → Copy the anon key
3. Update `.env`: `VITE_SUPABASE_PUBLISHABLE_KEY=<new_key>`
4. Restart dev server

### **Issue: "RLS Policy Error" or "Permission Denied"**

**Solution:**
1. Go to Supabase dashboard
2. SQL Editor → Run:
```sql
-- Disable RLS temporarily for testing (SECURITY: Enable after testing!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
```

### **Issue: "Table does not exist"**

**Solution:**
1. Check Supabase dashboard → Table Editor
2. Verify tables exist:
   - profiles
   - user_roles
   - tests
   - submissions
   - surveys
3. If missing, run migrations:
```bash
cd /Users/lokeshgundlapplly/userninjas-3
supabase db pull  # Sync with remote
```

### **Issue: "Connection Timeout"**

**Solution:**
1. Check internet connection
2. Check Supabase status: https://status.supabase.com
3. Try different network (WiFi/Mobile)
4. Increase timeout in client.ts:
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js/2.88.0',
    },
  },
});
```

---

## 📊 Expected Test Results

### **Successful Connection Looks Like:**

```
✓ Test 1: Client Initialization
  URL: https://itkmsjqiaphxwwekevqp.supabase.co
  Auth enabled: true

✓ Test 2: Session Check
  Session status: ⚪ Not logged in

✓ Test 3: Database Query (profiles table)
  ✅ Query successful!
  Row count: 5
  Sample data: { user_id: "...", email: "..." }

✓ Test 4: Database Query (user_roles table)
  ✅ Query successful!
  Row count: 3

✓ Test 5: Database Query (tests table)
  ✅ Query successful!
  Row count: 10

==================================================
✅ ALL TESTS PASSED - Supabase is connected!
==================================================
```

---

## 🚀 Next Steps After Verification

Once connected, you can:

1. **Add Test Data:**
   - Go to Supabase dashboard → Table Editor
   - Insert sample records

2. **Test Authentication:**
   - Try signup/login on your app
   - Verify user appears in Supabase Auth section

3. **Monitor Activity:**
   - Supabase → Logs section
   - Monitor API requests and errors

4. **View Real-time Data:**
   - Subscribe to table changes (if implemented)
   - Track submissions in real-time

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Community:** https://discord.gg/bnncdtPznV
- **Status Page:** https://status.supabase.com
- **Contact Support:** https://app.supabase.com/support/new
