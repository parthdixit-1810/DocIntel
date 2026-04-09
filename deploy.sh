#!/bin/bash

# DocIntel AI - Quick Deploy Script
# This script helps you deploy the application quickly

set -e

echo "🚀 DocIntel AI - Deployment Helper"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Project directory verified"
echo ""

# Check dependencies
echo "📦 Checking dependencies..."
npm list > /dev/null 2>&1 || npm install
echo "✅ Dependencies ready"
echo ""

# Run linting
echo "🔍 Running TypeScript check..."
npm run lint > /dev/null 2>&1 && echo "✅ No TypeScript errors" || echo "⚠️  TypeScript check failed"
echo ""

# Build
echo "🏗️  Building application..."
npm run build
echo "✅ Build complete"
echo ""

echo "📋 Deployment Options:"
echo "1️⃣  Deploy to Google Cloud Run (Recommended for AI Studio)"
echo "2️⃣  Deploy with Docker"
echo "3️⃣  Deploy to Vercel"
echo "4️⃣  Deploy to Railway.app"
echo "5️⃣  Deploy to Render.com"
echo ""

echo "📝 For detailed instructions, see DEPLOYMENT.md"
echo ""

echo "🎯 Next Steps:"
echo "1. Configure .env.local with GEMINI_API_KEY"
echo "2. Verify Firebase configuration"
echo "3. Choose a deployment platform"
echo "4. Follow the instructions in DEPLOYMENT.md"
echo ""

echo "📊 Build Stats:"
du -sh dist/ 2>/dev/null || echo "Build artifacts in dist/"
echo ""

echo "✅ Project is ready for deployment!"
