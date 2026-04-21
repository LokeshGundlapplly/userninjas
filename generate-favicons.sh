#!/bin/bash
# Favicon Generation Script
# This script generates favicon files from the logo.png using ImageMagick

echo "🥷 User Ninjas Favicon Setup"
echo "====================================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick not found. Installing..."
  
  # Detect OS and install ImageMagick
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v brew &> /dev/null; then
      brew install imagemagick
    else
      echo "Please install Homebrew first: https://brew.sh"
      exit 1
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo apt-get update
    sudo apt-get install -y imagemagick
  else
    echo "Please install ImageMagick manually: https://imagemagick.org/"
    exit 1
  fi
fi

# Create favicon files from logo.png
cd "$(dirname "$0")/public"

echo "📦 Generating favicon files from logo.png..."

# Generate ICO file (64x64)
convert logo.png -define icon:auto-resize=64,48,32,16 favicon.ico
echo "✅ Created favicon.ico (64x64)"

# Generate PNG files
convert logo.png -resize 32x32 favicon-32x32.png
echo "✅ Created favicon-32x32.png"

convert logo.png -resize 16x16 favicon-16x16.png
echo "✅ Created favicon-16x16.png"

# Generate Apple Touch Icon (180x180)
convert logo.png -resize 180x180 -background white -gravity center -extent 180x180 apple-touch-icon.png
echo "✅ Created apple-touch-icon.png (180x180)"

echo ""
echo "====================================="
echo "✅ All favicon files generated successfully!"
echo ""
echo "Files created:"
echo "  - public/favicon.ico"
echo "  - public/favicon-32x32.png"
echo "  - public/favicon-16x16.png"
echo "  - public/apple-touch-icon.png"
echo ""
echo "Next steps:"
echo "1. Verify files in public/ folder"
echo "2. Test in browser (may need hard refresh)"
echo "3. Commit to git"
echo ""
