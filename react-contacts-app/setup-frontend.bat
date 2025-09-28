@echo off
echo Setting up Document Verification Frontend...
echo.

echo Installing dependencies...
npm install

echo.
echo Creating environment file...
copy env.example .env

echo.
echo Setup complete! 
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Make sure your backend API is running on https://localhost:7001
echo.
pause
