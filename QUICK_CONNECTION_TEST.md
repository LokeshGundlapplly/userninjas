# 🚀 Quick Reference - How to Check Supabase Connection

## 30-Second Test

1. **Open** http://localhost:8080/ in browser
2. Press **F12** (DevTools)
3. Go to **Console** tab
4. **Copy-paste this:**

```javascript
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log(error ? '❌ ' + error.message : '✅ Connected!');
```

**Result:**
- ✅ `Connected!` = Your Supabase is working! 🎉
- ❌ Error message = See troubleshooting below

---

## 3 Ways to Verify Connection

### 1️⃣ **Console Command (Fastest)**
```javascript
window.testSupabaseConnection()
```
Check the console output for ✅ or ❌

### 2️⃣ **Add Test Component to Any Page**
```tsx
import { SupabaseConnectionTester } from '@/components/SupabaseConnectionTester';

export default function Page() {
  return <SupabaseConnectionTester />;
}
```

### 3️⃣ **Direct Database Query**
```javascript
import { supabase } from '@/integrations/supabase/client';

// Try to fetch profiles
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

if (error) {
  console.error('Connection failed:', error.message);
} else {
  console.log('Connected! Found', data?.length || 0, 'profiles');
}
```

---

## ✅ What "Connected" Looks Like

```
URL: https://itkmsjqiaphxwwekevqp.supabase.co
Auth enabled: true
✅ Query successful!
Connected! Found 5 profiles
```

## ❌ What "Disconnected" Looks Like

```
❌ Error: fetch failed
or
❌ Error: invalid API key
or  
❌ Error: timeout
```

---

## 🔧 Quick Fixes

| Problem | Solution |
|---------|----------|
| `fetch failed` | Restart dev server: `npm run dev` |
| `invalid API key` | Check `.env` file has correct keys |
| `timeout` | Check internet connection |
| `CORS error` | Clear cache (Cmd+Shift+Delete) |
| `Table not found` | Check Supabase dashboard has the table |

---

## 📍 Key Files You Now Have

1. **Test Utility:** `/src/utils/supabase-test.ts`
   - Comprehensive connection test function

2. **Test Component:** `/src/components/SupabaseConnectionTester.tsx`
   - React component with UI for testing

3. **This Checklist:** `/VERIFY_SUPABASE_CONNECTION.md`
   - Detailed troubleshooting guide

4. **Setup Guide:** `/SUPABASE_SETUP_GUIDE.md`
   - How to access and work with data

5. **Logo Guide:** `/CUSTOM_LOGO_SETUP.md`
   - How to add your brand logo

---

## 🎯 Your Current Status

✅ **Supabase is configured**  
✅ **Dev server is running** (http://localhost:8080)  
✅ **Connection tests are available**  
✅ **Lovable branding removed**  
✅ **User Ninjas branding active**  

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://app.supabase.com
- **Your Project:** https://app.supabase.com/project/itkmsjqiaphxwwekevqp
- **Local App:** http://localhost:8080/
- **Documentation:** /VERIFY_SUPABASE_CONNECTION.md

---

**You're all set! 🎉 Run the test and let me know if you see ✅ or ❌**
