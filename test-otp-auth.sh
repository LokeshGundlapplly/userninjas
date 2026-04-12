#!/bin/bash
# Test Script for OTP-Based Authentication Flow
# This script tests the new signup and login flow with OTP verification

SUPABASE_URL="https://jpclnzgouzyroebjvcqp.supabase.co"
ANON_KEY="your_anon_key_here"  # Replace with actual anon key
API_URL="$SUPABASE_URL/functions/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== User Ninjas OTP Authentication Test ===${NC}\n"

# Test 1: Send OTP to a confirmed email
echo -e "${YELLOW}Test 1: Send OTP to confirmed email${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/send-login-otp" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }')

echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q "OTP sent"; then
  echo -e "${GREEN}✓ OTP generation successful${NC}\n"
else
  echo -e "${RED}✗ OTP generation failed${NC}\n"
fi

# Test 2: Verify OTP (this requires the actual OTP from the logs)
echo -e "${YELLOW}Test 2: Verify OTP${NC}"
# Note: You need to check the function logs to get the actual OTP
echo "To get the OTP:"
echo "1. Go to Supabase Dashboard → Functions → send-login-otp"
echo "2. View the logs to find: 'OTP for test@example.com: XXXXXX'"
echo "3. Replace OTP_CODE below with the actual code"

read -p "Enter the OTP code (6 digits): " OTP_CODE

if [ ${#OTP_CODE} -eq 6 ]; then
  VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/verify-login-otp" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"test@example.com\",
      \"otp\": \"$OTP_CODE\"
    }")
  
  echo "Response: $VERIFY_RESPONSE"
  if echo "$VERIFY_RESPONSE" | grep -q "OTP verified"; then
    echo -e "${GREEN}✓ OTP verification successful${NC}\n"
  else
    echo -e "${RED}✗ OTP verification failed${NC}\n"
  fi
else
  echo -e "${RED}✗ Invalid OTP format (must be 6 digits)${NC}\n"
fi

echo -e "${GREEN}=== Test Complete ===${NC}"
