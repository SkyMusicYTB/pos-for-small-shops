@echo off
echo 🚀 Setting up Multi-tenant POS System...
echo ========================================

echo [INFO] Checking Supabase connection...
curl -s -f http://localhost:8000/health > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Supabase is not running on http://localhost:8000
    echo [WARNING] Please start your local Supabase instance first:
    echo [WARNING]   supabase start
    exit /b 1
)
echo [SUCCESS] Supabase is running on http://localhost:8000

echo [INFO] Setting up backend...
cd backend
if not exist node_modules (
    echo [INFO] Installing backend dependencies...
    npm install
)
echo [INFO] Building backend...
npm run build
cd ..

echo [INFO] Setting up frontend...
cd frontend
if not exist node_modules (
    echo [INFO] Installing frontend dependencies...
    npm install
)
cd ..

echo [SUCCESS] Setup completed successfully!
echo.
echo 🎉 Multi-tenant POS System is ready!
echo ====================================
echo.
echo To start the system:
echo   1. In one terminal: cd backend && npm run dev
echo   2. In another terminal: cd frontend && npm run dev
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:3001
echo.
echo 📝 Default Super Admin Credentials:
echo    Email:    admin@example.com
echo    Password: Admin123!
echo.
echo ⚠️  Please change the password after first login
pause