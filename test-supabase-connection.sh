#!/bin/bash

# Quick Supabase Connection Status Check
# This script checks if your remote Supabase is accessible

echo "🔍 Checking Supabase Remote Connection Status..."
echo ""

# Get credentials from .env
PROJECT_ID=$(grep "^VITE_SUPABASE_PROJECT_ID" .env | cut -d'=' -f2)
SUPABASE_URL=$(grep "^VITE_SUPABASE_URL" .env | cut -d'=' -f2)
PUBLISHABLE_KEY=$(grep "^VITE_SUPABASE_PUBLISHABLE_KEY" .env | cut -d'=' -f2)

echo "Project ID: $PROJECT_ID"
echo "URL: $SUPABASE_URL"
echo "Key: ${PUBLISHABLE_KEY:0:20}..."
echo ""

# Test connectivity to Supabase
echo "Testing connection to remote Supabase..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${SUPABASE_URL}/rest/v1/?apikey=${PUBLISHABLE_KEY}" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
  echo "✅ Remote Supabase is ACCESSIBLE"
  echo "HTTP Status: $HTTP_CODE"
  echo ""
  echo "✨ Your app can connect to Supabase!"
  echo ""
  echo "Next: Run 'npm run dev' and test in browser console"
else
  echo "⚠️ Connection Status: $HTTP_CODE"
  echo ""
  echo "Possible issues:"
  echo "1. Check internet connection"
  echo "2. Verify .env has correct credentials"
  echo "3. Check Supabase project is active"
fi
