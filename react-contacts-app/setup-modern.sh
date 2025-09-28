#!/bin/bash

echo "🚀 Setting up Modern RiskGuard Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install all the new dependencies
npm install

echo "🎨 Setting up Tailwind CSS..."

# Initialize Tailwind CSS
npx tailwindcss init -p

echo "🔧 Building the application..."

# Build the application
npm run build

echo "✅ Setup complete!"
echo ""
echo "🎉 Your modern RiskGuard application is ready!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo ""
echo "Features added:"
echo "  ✨ Modern UI with Tailwind CSS"
echo "  🎭 Beautiful animations with Framer Motion"
echo "  📊 Interactive charts with Chart.js"
echo "  🔔 Toast notifications"
echo "  📱 Responsive design"
echo "  🎨 Glass morphism effects"
echo "  ⚡ Performance optimizations"
echo ""
echo "Happy coding! 🚀"
