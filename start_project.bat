@echo off
echo 🌱 Starting GreenCart Project...
echo =================================

REM Check and start MongoDB
echo 📊 Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo 🔄 Starting MongoDB...
    net start MongoDB
) else (
    echo ✅ MongoDB is running
)

REM Start Backend Server
echo.
echo 🔧 Starting Backend Server...
cd /d "d:\GreenCart\backend"
start "GreenCart Backend" cmd /k "python app.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo 🌐 Starting Frontend Server...
cd /d "d:\GreenCart\frontend"
start "GreenCart Frontend" cmd /k "npm start"

echo.
echo 🎉 GreenCart Project Started!
echo ==============================
echo 🔗 Application URLs:
echo    📱 Main App:        http://localhost:3000
echo    🔐 Login:           http://localhost:3000/login
echo    📝 Signup:          http://localhost:3000/signup
echo    📊 Dashboard:       http://localhost:3000/dashboard
echo    🗄️  Database Status: http://localhost:3000/db-status
echo    🔧 Backend API:     http://localhost:5000
echo.
echo ⏳ Servers are starting... Please wait 30-60 seconds
echo 🌐 The application will open automatically when ready
echo.

REM Wait for servers to start and open browser
timeout /t 30 /nobreak >nul
start http://localhost:3000

echo ✨ Project is ready!
echo 🛑 Close the backend and frontend command windows to stop the servers
pause