#!/bin/bash
# Email Configuration Diagnostic Script
# This script checks if SMTP is properly configured for your Supabase project

echo "=== Email Configuration Diagnostic ==="
echo ""
echo "Project: jpclnzgouzyroebjvcqp (User Ninjas)"
echo ""

echo "📋 Checking local configuration..."
echo ""

# Check if templates exist
echo "Email Templates:"
for template in confirmation invite recovery magic_link email_change reauthentication; do
  if [ -f "supabase/templates/${template}.html" ]; then
    echo "  ✓ ${template}.html"
  else
    echo "  ✗ ${template}.html (MISSING)"
  fi
done

echo ""
echo "📊 Supabase Configuration in config.toml:"
echo "  - Enable confirmations: $(grep 'enable_confirmations' supabase/config.toml)"
echo "  - OTP enabled: $(grep 'otp_length' supabase/config.toml)"
echo ""

echo "⚠️  NEXT STEPS TO FIX EMAIL SENDING:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select project: userninjas (jpclnzgouzyroebjvcqp)"
echo "3. Navigate to: Project Settings → Authentication → SMTP Settings"
echo "4. Choose one of these options:"
echo ""
echo "   A) Use Supabase's built-in email (default, might be limited)"
echo "   B) Configure SendGrid (recommended)"
echo "   C) Configure Resend"
echo ""
echo "5. Click 'Send test email' to verify it works"
echo ""

echo "🧪 To test manually after SMTP is configured:"
echo "   1. Go to your signup page"
echo "   2. Sign up with a test email you can access"
echo "   3. Check your inbox for confirmation email"
echo "   4. Click the confirmation link"
echo ""

echo "💡 Current Authentication Flow:"
echo "   1. User signs up → email sent to Supabase SMTP"
echo "   2. Supabase sends confirmation email using template"
echo "   3. User clicks link → email is confirmed"
echo "   4. User can now login → OTP sent to email"
echo ""

echo "❌ If emails still don't arrive:"
echo "   - Check spam/junk folder"
echo "   - Verify sender email is verified in SMTP provider"
echo "   - Contact your email provider support"
echo "   - Check Supabase logs: Dashboard → Logs → Auth"
echo ""
