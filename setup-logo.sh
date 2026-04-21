#!/bin/bash

# Logo Setup Helper Script
# This script helps you set up your new logo throughout the application

echo "🎨 User Ninjas Logo Setup Helper"
echo "=================================="
echo ""

# Check if logo.png exists
if [ -f "public/logo.png" ]; then
    echo "✅ Found: /public/logo.png"
    LOGO_SIZE=$(ls -lh public/logo.png | awk '{print $5}')
    echo "   Size: $LOGO_SIZE"
else
    echo "⚠️  Missing: /public/logo.png"
    echo "   ACTION: Save your new logo image to public/logo.png"
    echo ""
fi

echo ""
echo "📋 Logo Locations in App:"
echo "=========================="
echo ""
echo "✅ Updated Files:"
grep -l "NinjaLogo" src/components/*.tsx 2>/dev/null | while read file; do
    echo "   - $file"
done

echo ""
echo "📁 Favicon Files to Update:"
echo "=========================="

FAVICON_FILES=(
    "public/favicon.png:64x64"
    "public/favicon-16x16.png:16x16"
    "public/favicon-32x32.png:32x32"
    "public/apple-touch-icon.png:180x180"
)

for file_info in "${FAVICON_FILES[@]}"; do
    IFS=':' read -r file size <<< "$file_info"
    if [ -f "$file" ]; then
        echo "✅ Found: $file ($size)"
    else
        echo "⚠️  Missing: $file ($size)"
    fi
done

echo ""
echo "🚀 Quick Setup Steps:"
echo "===================="
echo ""
echo "1️⃣  Save Your Logo"
echo "   Copy your new logo image to: public/logo.png"
echo "   Format: PNG (transparent background recommended)"
echo "   Size: 512x512px or larger"
echo ""
echo "2️⃣  Generate Favicons"
echo "   Visit: https://realfavicongenerator.net/"
echo "   Upload: public/logo.png"
echo "   Download the favicon package"
echo "   Extract all files to public/"
echo ""
echo "3️⃣  Verify"
echo "   npm run dev"
echo "   Check: http://localhost:8082"
echo "   Clear cache (Ctrl+Shift+Delete) if needed"
echo ""
echo "4️⃣  Test Locations"
echo "   - Navbar (top-left)"
echo "   - Footer (bottom-left)"
echo "   - Chat widget (header)"
echo "   - Browser favicon (tab)"
echo ""

echo "📖 For detailed instructions, see: LOGO_UPDATE_GUIDE.md"
echo ""
echo "✨ All done! Your logo will appear everywhere automatically."
