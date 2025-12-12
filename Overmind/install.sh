#!/bin/bash
# ========================================
# Overmind Tools Suite - Installation Script
# For Linux systems with Node.js
# ========================================

set -e

echo "🚀 Installing Overmind Tools Suite..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..
echo "✅ Server dependencies installed"
echo ""

# Install web dependencies
echo "📦 Installing web dependencies..."
cd web
npm install
cd ..
echo "✅ Web dependencies installed"
echo ""

# Setup environment file
echo "⚙️  Setting up environment..."
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Created .env file from template"
    echo "⚠️  IMPORTANT: Edit server/.env and set:"
    echo "   - ADMIN_PASSWORD (required)"
    echo "   - OPENAI_API_KEY (for AI chat)"
    echo "   - SITE_URL (your production domain)"
else
    echo "✅ .env file already exists"
fi
echo ""

# Initialize database
echo "🗄️  Initializing databases..."
cd server
node -e "require('./db/init.js')()"
cd ..
echo "✅ Databases initialized"
echo ""

# Build frontend
echo "🏗️  Building frontend..."
cd web
npm run build
cd ..
echo "✅ Frontend built"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p server/data
mkdir -p server/uploads
mkdir -p server/logs
echo "✅ Directories created"
echo ""

echo "✨ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit server/.env with your configuration"
echo "   2. Set ADMIN_PASSWORD in .env"
echo "   3. Set OPENAI_API_KEY in .env (for AI chat)"
echo ""
echo "🚀 To start in development mode:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd web && npm run dev"
echo ""
echo "🚀 To start in production mode:"
echo "   cd server && npm start"
echo ""
echo "🔒 Remember: This tool suite is for internal use only!"
echo ""
