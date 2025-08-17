# 🚀 GreenCart Quick Start Guide

## 🎯 **FASTEST WAY TO START**

### **Option 1: Double-click to start (Easiest)**
```
📁 Double-click: d:\GreenCart\start_project.bat
```
This will automatically start everything and open your browser!

### **Option 2: PowerShell Script**
```powershell
# Run in PowerShell
Set-Location "d:\GreenCart"
.\start_project.ps1
```

### **Option 3: Manual Commands**

#### **Terminal 1 - Backend:**
```powershell
Set-Location "d:\GreenCart\backend"
python app.py
```

#### **Terminal 2 - Frontend:**
```powershell
Set-Location "d:\GreenCart\frontend"
npm start
```

## 🌐 **Application URLs**

Once started, visit these URLs:

- **🏠 Main App**: http://localhost:3000
- **🔐 Login**: http://localhost:3000/login
- **📝 Signup**: http://localhost:3000/signup
- **📊 Dashboard**: http://localhost:3000/dashboard
- **🗄️ Database Status**: http://localhost:3000/db-status
- **🔧 Backend API**: http://localhost:5000

## ⚡ **One-Time Setup (First Run Only)**

If this is your first time running the project:

### **Backend Dependencies:**
```powershell
Set-Location "d:\GreenCart\backend"
pip install flask flask-cors pymongo werkzeug pyjwt
```

### **Frontend Dependencies:**
```powershell
Set-Location "d:\GreenCart\frontend"
npm install
```

## 🔧 **Troubleshooting**

### **MongoDB Not Running?**
```powershell
net start MongoDB
```

### **Port Already in Use?**
- Backend (5000): Kill any Python processes
- Frontend (3000): Kill any Node processes

### **Dependencies Missing?**
```powershell
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd frontend
npm install
```

## 🎉 **Success Indicators**

You'll know everything is working when:

✅ **Backend**: Console shows "Running on http://127.0.0.1:5000"  
✅ **Frontend**: Browser opens to http://localhost:3000  
✅ **MongoDB**: Database status shows "Connected"  
✅ **Authentication**: You can register and login users  

## 🛑 **How to Stop**

- **Batch file**: Close the command windows that opened
- **PowerShell**: Press `Ctrl+C` in the PowerShell window
- **Manual**: Press `Ctrl+C` in each terminal

---

**🎯 TL;DR: Double-click `start_project.bat` and wait 30 seconds!**