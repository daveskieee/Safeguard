@echo off
echo 🌊 HydroGuard - Complete System Setup
echo ======================================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)
echo ✓ Node.js is installed
node --version
echo.

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found
    pause
    exit /b 1
)
echo ✓ npm is installed
npm --version
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Backend setup failed
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
cd ..
echo.

REM Setup Frontend
echo 🎨 Setting up Frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Frontend setup failed
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
cd ..
echo.

echo ✓ Setup complete!
echo.
echo 📖 Next steps:
echo 1. Backend: cd backend ^&^& npm start
echo 2. Frontend: cd frontend ^&^& npm start
echo 3. Hardware: See SETUP.md
echo.
echo 🌐 Dashboard: http://localhost:3000
echo 🔌 API: http://localhost:5000
echo.
pause
