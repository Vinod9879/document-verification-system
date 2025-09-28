@echo off
echo 🚀 Setting up Modern RiskGuard Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
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

echo 📦 Installing dependencies...

REM Install all the new dependencies
npm install

echo 🎨 Setting up Tailwind CSS...

REM Initialize Tailwind CSS
npx tailwindcss init -p

echo 🔧 Building the application...

REM Build the application
npm run build

echo ✅ Setup complete!
echo.
echo 🎉 Your modern RiskGuard application is ready!
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To build for production:
echo   npm run build
echo.
echo Features added:
echo   ✨ Modern UI with Tailwind CSS
echo   🎭 Beautiful animations with Framer Motion
echo   📊 Interactive charts with Chart.js
echo   🔔 Toast notifications
echo   📱 Responsive design
echo   🎨 Glass morphism effects
echo   ⚡ Performance optimizations
echo.
echo Happy coding! 🚀
pause
