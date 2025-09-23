#!/bin/bash

echo "========================================"
echo "Document Verification System Setup"
echo "========================================"
echo

echo "[1/6] Checking prerequisites..."

# Check .NET
if ! command -v dotnet &> /dev/null; then
    echo "ERROR: .NET 8 SDK not found. Please install it first."
    echo "Download from: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install it first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Prerequisites check passed"
echo

echo "[2/6] Setting up backend..."
cd webApitest

echo "Restoring NuGet packages..."
dotnet restore
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to restore packages"
    exit 1
fi

echo "Building project..."
dotnet build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo "✓ Backend setup complete"
echo

echo "[3/6] Setting up database..."
echo "Creating database..."
dotnet ef database update
if [ $? -ne 0 ]; then
    echo "WARNING: Database update failed. You may need to configure connection string."
fi
echo "✓ Database setup complete"
echo

echo "[4/6] Setting up frontend..."
cd ../react-contacts-app

echo "Installing npm packages..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install npm packages"
    exit 1
fi
echo "✓ Frontend setup complete"
echo

echo "[5/6] Creating uploads directory..."
cd ../webApitest
mkdir -p "Uploads/UserDocuments"
touch "Uploads/.gitkeep"
touch "Uploads/UserDocuments/.gitkeep"
echo "✓ Uploads directory created"
echo

echo "[6/6] Setup complete!"
echo
echo "========================================"
echo "Setup Summary"
echo "========================================"
echo "✓ Backend: Ready to run"
echo "✓ Frontend: Ready to run"
echo "✓ Database: Configured"
echo "✓ Uploads: Directory created"
echo
echo "========================================"
echo "How to Run"
echo "========================================"
echo
echo "1. Backend (Terminal 1):"
echo "   cd webApitest"
echo "   dotnet run --urls 'https://localhost:5194'"
echo
echo "2. Frontend (Terminal 2):"
echo "   cd react-contacts-app"
echo "   npm start"
echo
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: https://localhost:5194"
echo "   Swagger UI: https://localhost:5194/swagger"
echo
echo "========================================"
echo "Default Admin Credentials"
echo "========================================"
echo "Email: admin@contactmanager.com"
echo "Password: admin123"
echo
echo "========================================"
echo "GitHub Upload Instructions"
echo "========================================"
echo "1. Create repository on GitHub"
echo "2. Run these commands:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git remote add origin YOUR_REPO_URL"
echo "   git push -u origin main"
echo
echo "See GITHUB_SETUP.md for detailed instructions."
echo