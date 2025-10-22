@echo off
echo 🚀 QA Portfolio Deployment Helper
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo ✅ Vercel CLI is ready

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate

if %errorlevel% neq 0 (
    echo ⚠️  Prisma client generation failed. This is normal if DATABASE_URL is not set yet.
)

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. Deploy to Vercel
echo 3. Set up your database
echo 4. Configure environment variables
echo.
echo 📖 Read SETUP_GUIDE.md for detailed instructions
echo.
echo Quick commands:
echo   git remote add origin https://github.com/YOUR_USERNAME/qa-portfolio.git
echo   git push -u origin main
echo   vercel
echo.
pause
