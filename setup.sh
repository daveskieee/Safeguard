#!/bin/bash

echo "🌊 HydroGuard - Complete System Setup"
echo "======================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi
echo "✓ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✓ npm $(npm --version)"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend setup failed"
    exit 1
fi
echo "✓ Backend dependencies installed"

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend setup failed"
    exit 1
fi
echo "✓ Frontend dependencies installed"

echo ""
echo "✓ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd frontend && npm start"
echo "3. Hardware: See SETUP.md"
echo ""
echo "🌐 Dashboard: http://localhost:3000"
echo "🔌 API: http://localhost:5000"
