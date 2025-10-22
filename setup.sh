#!/bin/bash

# QA Portfolio - Quick Deployment Script
# This script helps you deploy your QA Portfolio to Vercel

echo "🚀 QA Portfolio Deployment Helper"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "⚠️  Prisma client generation failed. This is normal if DATABASE_URL is not set yet."
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy to Vercel"
echo "3. Set up your database"
echo "4. Configure environment variables"
echo ""
echo "📖 Read SETUP_GUIDE.md for detailed instructions"
echo ""
echo "Quick commands:"
echo "  git remote add origin https://github.com/YOUR_USERNAME/qa-portfolio.git"
echo "  git push -u origin main"
echo "  vercel"
echo ""
