#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  User Ninjas OTP & Password Reset - Configuration Checker    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Check .env file
echo -e "${YELLOW}[1/5] Checking .env configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

if grep -q "VITE_SUPABASE_URL=" .env; then
    SUPABASE_URL=$(grep "VITE_SUPABASE_URL=" .env | cut -d'=' -f2)
    echo -e "${GREEN}✓ Supabase URL found${NC}"
else
    echo -e "${RED}✗ VITE_SUPABASE_URL not set${NC}"
fi

if grep -q "VITE_SUPABASE_PUBLISHABLE_KEY=" .env; then
    KEY=$(grep "VITE_SUPABASE_PUBLISHABLE_KEY=" .env | cut -d'=' -f2)
    if [[ $KEY == eyJ* ]]; then
        echo -e "${GREEN}✓ Publishable key is JWT format (correct!)${NC}"
    elif [[ $KEY == sb_publishable* ]]; then
        echo -e "${RED}✗ Publishable key is management token (WRONG - use JWT anon key)${NC}"
    else
        echo -e "${YELLOW}⚠ Publishable key format unclear${NC}"
    fi
else
    echo -e "${RED}✗ VITE_SUPABASE_PUBLISHABLE_KEY not set${NC}"
fi

echo ""

# 2. Check migration file exists
echo -e "${YELLOW}[2/5] Checking database migrations...${NC}"
if [ -f "supabase/migrations/20260412000000_add_login_otps_table.sql" ]; then
    echo -e "${GREEN}✓ login_otps migration exists${NC}"
else
    echo -e "${RED}✗ login_otps migration not found${NC}"
fi

echo ""

# 3. Check edge functions
echo -e "${YELLOW}[3/5] Checking edge functions...${NC}"
if [ -f "supabase/functions/send-login-otp/index.ts" ]; then
    echo -e "${GREEN}✓ send-login-otp function exists${NC}"
else
    echo -e "${RED}✗ send-login-otp function not found${NC}"
fi

if [ -f "supabase/functions/verify-login-otp/index.ts" ]; then
    echo -e "${GREEN}✓ verify-login-otp function exists${NC}"
else
    echo -e "${RED}✗ verify-login-otp function not found${NC}"
fi

echo ""

# 4. Check React components
echo -e "${YELLOW}[4/5] Checking React components...${NC}"
if grep -q "handleVerifyOtp" src/pages/Auth.tsx; then
    echo -e "${GREEN}✓ OTP verification in Auth.tsx${NC}"
else
    echo -e "${RED}✗ OTP verification not found in Auth.tsx${NC}"
fi

if grep -q "handleForgotPassword" src/pages/Auth.tsx; then
    echo -e "${GREEN}✓ Forgot password in Auth.tsx${NC}"
else
    echo -e "${RED}✗ Forgot password not found in Auth.tsx${NC}"
fi

if [ -f "src/pages/ResetPassword.tsx" ]; then
    echo -e "${GREEN}✓ ResetPassword page exists${NC}"
else
    echo -e "${RED}✗ ResetPassword page not found${NC}"
fi

echo ""

# 5. Check routing
echo -e "${YELLOW}[5/5] Checking application routing...${NC}"
if grep -q "path.*reset-password" src/App.tsx; then
    echo -e "${GREEN}✓ /reset-password route configured${NC}"
else
    echo -e "${RED}✗ /reset-password route not found${NC}"
fi

if grep -q "import.*ResetPassword" src/App.tsx; then
    echo -e "${GREEN}✓ ResetPassword component imported${NC}"
else
    echo -e "${RED}✗ ResetPassword component not imported${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    ✅ Configuration Check Complete             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Deploy edge functions:"
echo "   supabase functions deploy send-login-otp"
echo "   supabase functions deploy verify-login-otp"
echo ""
echo "2. Set RESEND_API_KEY in Supabase Dashboard:"
echo "   Project Settings → Functions → Secrets"
echo ""
echo "3. Run the app:"
echo "   npm run dev"
echo ""
echo "4. Test OTP sign-in:"
echo "   - Go to http://localhost:8080/auth"
echo "   - Click Sign In"
echo "   - Enter email & password"
echo "   - Enter 6-digit code from email"
echo ""
echo "5. Test password reset:"
echo "   - Go to http://localhost:8080/auth"
echo "   - Click 'Forgot password?'"
echo "   - Enter email"
echo "   - Click link from email"
echo "   - Set new password"
echo ""
