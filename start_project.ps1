# GreenCart Project Startup Script
# Run this script to start the complete project

Write-Host "🌱 Starting GreenCart Project..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB status..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($mongoService -eq $null) {
    Write-Host "❌ MongoDB service not found. Please install MongoDB first." -ForegroundColor Red
    exit 1
}

if ($mongoService.Status -ne "Running") {
    Write-Host "🔄 Starting MongoDB service..." -ForegroundColor Yellow
    try {
        Start-Service -Name "MongoDB"
        Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to start MongoDB: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ MongoDB is already running" -ForegroundColor Green
}

# Start Backend Server
Write-Host "`n🔧 Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Location: d:\GreenCart\backend" -ForegroundColor Gray

# Check if backend directory exists
if (-not (Test-Path "d:\GreenCart\backend")) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

# Start backend in background
$backendJob = Start-Job -ScriptBlock {
    Set-Location "d:\GreenCart\backend"
    python app.py
}

Write-Host "✅ Backend server starting (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Test backend connection
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000" -TimeoutSec 5
    Write-Host "✅ Backend server is responding: $response" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend server starting... (may take a moment)" -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "`n🌐 Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Location: d:\GreenCart\frontend" -ForegroundColor Gray

# Check if frontend directory exists
if (-not (Test-Path "d:\GreenCart\frontend")) {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Start frontend in background
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "d:\GreenCart\frontend"
    npm start
}

Write-Host "✅ Frontend server starting (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Display startup information
Write-Host "`n🎉 GreenCart Project Started!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host "🔗 Application URLs:" -ForegroundColor Cyan
Write-Host "   📱 Main App:        http://localhost:3000" -ForegroundColor White
Write-Host "   🔐 Login:           http://localhost:3000/login" -ForegroundColor White
Write-Host "   📝 Signup:          http://localhost:3000/signup" -ForegroundColor White
Write-Host "   📊 Dashboard:       http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "   🗄️  Database Status: http://localhost:3000/db-status" -ForegroundColor White
Write-Host "   🔧 Backend API:     http://localhost:5000" -ForegroundColor White

Write-Host "`n📋 Server Status:" -ForegroundColor Cyan
Write-Host "   🗄️  MongoDB:   Running" -ForegroundColor Green
Write-Host "   🔧 Backend:    Starting (Port 5000)" -ForegroundColor Yellow
Write-Host "   🌐 Frontend:   Starting (Port 3000)" -ForegroundColor Yellow

Write-Host "`n⏳ Waiting for servers to fully start..." -ForegroundColor Yellow
Write-Host "   This may take 30-60 seconds for first-time startup" -ForegroundColor Gray

# Wait for frontend to start (usually takes longer)
$timeout = 60
$elapsed = 0
$frontendReady = $false

while ($elapsed -lt $timeout -and -not $frontendReady) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
        }
    } catch {
        # Still starting...
    }
    
    if ($elapsed % 10 -eq 0) {
        Write-Host "   ⏳ Still starting... ($elapsed/$timeout seconds)" -ForegroundColor Gray
    }
}

if ($frontendReady) {
    Write-Host "`n🎉 SUCCESS! All servers are running!" -ForegroundColor Green
    Write-Host "🌐 Opening application in browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
} else {
    Write-Host "`n⚠️  Servers are still starting. Please wait a moment and then visit:" -ForegroundColor Yellow
    Write-Host "   http://localhost:3000" -ForegroundColor White
}

Write-Host "`n🛑 To stop the servers:" -ForegroundColor Red
Write-Host "   Press Ctrl+C in this window or run: Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray

Write-Host "`n📖 For more information, see:" -ForegroundColor Cyan
Write-Host "   - AUTHENTICATION_README.md" -ForegroundColor White
Write-Host "   - MONGODB_CONNECTION_GUIDE.md" -ForegroundColor White

# Keep script running to maintain jobs
Write-Host "`n✨ Project is ready! Press Ctrl+C to stop all servers." -ForegroundColor Green
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed") {
            Write-Host "❌ Backend server failed!" -ForegroundColor Red
            Receive-Job $backendJob
            break
        }
        
        if ($frontendJob.State -eq "Failed") {
            Write-Host "❌ Frontend server failed!" -ForegroundColor Red
            Receive-Job $frontendJob
            break
        }
    }
} catch {
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped." -ForegroundColor Green
}