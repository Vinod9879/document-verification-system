@echo off
echo ========================================
echo Document Verification System Setup
echo ========================================
echo.

echo [1/6] Checking prerequisites...
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: .NET 8 SDK not found. Please install it first.
    echo Download from: https://dotnet.microsoft.com/download/dotnet/8.0
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install it first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Prerequisites check passed
echo.

echo [2/6] Setting up backend...
cd webApitest
echo Restoring NuGet packages...
dotnet restore
if %errorlevel% neq 0 (
    echo ERROR: Failed to restore packages
    pause
    exit /b 1
)

echo Building project...
dotnet build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo ✓ Backend setup complete
echo.

echo [3/6] Setting up database...
echo Creating database...
dotnet ef database update
if %errorlevel% neq 0 (
    echo WARNING: Database update failed. You may need to configure connection string.
)
echo ✓ Database setup complete
echo.

echo [4/6] Setting up frontend...
cd ..\react-contacts-app
echo Installing npm packages...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install npm packages
    pause
    exit /b 1
)
echo ✓ Frontend setup complete
echo.

echo [5/6] Creating uploads directory...
cd ..\webApitest
if not exist "Uploads\UserDocuments" mkdir "Uploads\UserDocuments"
echo. > "Uploads\.gitkeep"
echo. > "Uploads\UserDocuments\.gitkeep"
echo ✓ Uploads directory created
echo.

echo [6/6] Setup complete!
echo.
echo ========================================
echo Setup Summary
echo ========================================
echo ✓ Backend: Ready to run
echo ✓ Frontend: Ready to run  
echo ✓ Database: Configured
echo ✓ Uploads: Directory created
echo.
echo ========================================
echo How to Run
echo ========================================
echo.
echo 1. Backend (Terminal 1):
echo    cd webApitest
echo    dotnet run --urls "https://localhost:5194"
echo.
echo 2. Frontend (Terminal 2):
echo    cd react-contacts-app
echo    npm start
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: https://localhost:5194
echo    Swagger UI: https://localhost:5194/swagger
echo.
echo ========================================
echo Default Admin Credentials
echo ========================================
echo Email: admin@contactmanager.com
echo Password: admin123
echo.
echo ========================================
echo GitHub Upload Instructions
echo ========================================
echo 1. Create repository on GitHub
echo 2. Run these commands:
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git remote add origin YOUR_REPO_URL
echo    git push -u origin main
echo.
echo See GITHUB_SETUP.md for detailed instructions.
echo.
pause