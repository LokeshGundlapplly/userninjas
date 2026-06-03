#!/bin/bash

# Supabase Connection & Configuration Verification Script
# Usage: chmod +x verify-supabase.sh && ./verify-supabase.sh

echo "════════════════════════════════════════════════════════════"
echo "🧪 Supabase Connection & Configuration Verification"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to check if command succeeded
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
  fi
}

# 1. Check Node.js and npm
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣ Checking Node.js and npm"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

node --version > /dev/null 2>&1
check_status "Node.js installed"

npm --version > /dev/null 2>&1
check_status "npm installed"

# 2. Check .env file
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣ Checking .env Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f ".env" ]
check_status ".env file exists"

grep -q "VITE_SUPABASE_PROJECT_ID=jpclnzgouzyroebjvcqp" .env
check_status "Project ID is correct (jpclnzgouzyroebjvcqp)"

grep -q "VITE_SUPABASE_URL=https://jpclnzgouzyroebjvcqp.supabase.co" .env
check_status "Supabase URL is correct"

grep -q "VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc" .env
check_status "Supabase Publishable Key is set"

# Display current values
echo ""
echo "Current .env Supabase Configuration:"
grep "VITE_SUPABASE" .env | sed 's/^/  /'

# 3. Check Supabase configuration file
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣ Checking Supabase Local Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "supabase/config.toml" ]
check_status "supabase/config.toml exists"

grep -q 'project_id = "jpclnzgouzyroebjvcqp"' supabase/config.toml
check_status "Config.toml has correct project_id"

grep -q 'site_url = "https://.*userninjas.in"' supabase/config.toml
check_status "Auth site_url is configured"

# Display project ID from config
echo ""
echo "Current supabase/config.toml project_id:"
grep 'project_id' supabase/config.toml | sed 's/^/  /'

# 4. Check key files exist
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣ Checking Key Project Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "src/integrations/supabase/client.ts" ]
check_status "Supabase client file exists"

[ -f "src/integrations/supabase/types.ts" ]
check_status "Supabase types file exists"

[ -f "src/hooks/useAuth.tsx" ]
check_status "Authentication hook exists"

[ -d "node_modules" ]
check_status "node_modules directory exists"

# 5. Check package.json dependencies
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣ Checking Package Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q '@supabase/supabase-js' package.json
check_status "@supabase/supabase-js in package.json"

# 6. Check email templates
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣ Checking Email Templates (User Ninjas Branding)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "supabase/templates/confirmation.html" ]
check_status "Confirmation email template exists"

grep -q "User Ninjas" supabase/templates/confirmation.html
check_status "Confirmation template has User Ninjas branding"

[ -f "supabase/templates/magic_link.html" ]
check_status "Magic link email template exists"

grep -q "User Ninjas" supabase/templates/magic_link.html
check_status "Magic link template has User Ninjas branding"

# 7. Test Supabase CLI (optional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣ Checking Supabase CLI (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

supabase --version > /dev/null 2>&1
check_status "Supabase CLI installed"

# 8. Summary
echo ""
echo "════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! Supabase is configured correctly.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Run: npm run dev"
  echo "  2. Open: http://localhost:8080"
  echo "  3. Test signup/login functionality"
  exit 0
else
  echo -e "${RED}⚠️  Some checks failed. Please review the errors above.${NC}"
  exit 1
fi
