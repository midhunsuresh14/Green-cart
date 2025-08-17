# 🗄️ MongoDB Connection Guide for GreenCart

This guide shows you **multiple ways** to view and monitor your MongoDB connection and data for the GreenCart project.

## 📊 Current Database Status

**✅ MongoDB is Connected and Working!**

- **Connection URI**: `mongodb://localhost:27017/`
- **Database Name**: `greencart`
- **MongoDB Version**: 8.0.9
- **Database Size**: 0.90 KB
- **Collections**: users
- **Total Users**: 3 registered users

## 🔧 Methods to View MongoDB Connection

### 1. 🌐 Web-Based Database Dashboard (Recommended)

**URL**: http://localhost:3000/db-status

This is the most user-friendly way to view your MongoDB connection:

- **Beautiful UI**: Professional dashboard with real-time data
- **Connection Status**: Live connection indicator
- **Database Info**: Size, collections, user count
- **User Management**: View all registered users
- **Real-time Updates**: Refresh button to get latest data

**Features**:
- ✅ Connection status with visual indicators
- 📊 Database statistics and metrics
- 👥 Complete user list with details
- 🔄 Real-time refresh functionality
- 📱 Mobile-responsive design

### 2. 🔌 API Endpoints

#### Database Status Endpoint
```bash
GET http://localhost:5000/api/db-status
```

**Response Example**:
```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "database": "greencart",
  "connection_uri": "mongodb://localhost:27017/",
  "user_count": 3,
  "database_size": "0.90 KB",
  "collections": ["users"]
}
```

#### Users List Endpoint
```bash
GET http://localhost:5000/api/users
```

**Response Example**:
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "_id": "689502c5297c371940973f45",
      "name": "arshad karim",
      "email": "arshadkarim@gmail.com",
      "phone": "07510773622",
      "role": "user",
      "created_at": "Thu, 07 Aug 2025 19:47:17 GMT"
    }
  ]
}
```

### 3. 🐍 Python Scripts

#### Quick Database Info Script
```bash
cd backend
python show_db_info.py
```

**Output**:
```
🌱 GreenCart MongoDB Connection Info
==================================================
🔗 Connection URI: mongodb://localhost:27017/
🗄️  Database Name: greencart
✅ Connection Status: Connected
🖥️  MongoDB Version: 8.0.9
📦 Database Size: 0.90 KB
📁 Collections: users
👥 Total Users: 3
```

#### Interactive CLI Tool
```bash
cd backend
python mongo_cli.py
```

**Available Commands**:
- `info` - Show connection information
- `users` - List all users
- `stats` - Show database statistics
- `search <email>` - Search for user by email
- `delete <email>` - Delete user by email
- `help` - Show help message
- `exit` - Exit the CLI

### 4. 💻 Command Line Testing

#### Test Database Connection
```bash
curl http://localhost:5000/api/db-status
```

#### Test User Registration
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@example.com","phone":"1234567890","password":"password123"}'
```

#### Test User Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 5. 🔍 PowerShell Commands

#### Get Database Status (Windows)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/db-status" | ConvertTo-Json -Depth 3
```

#### Get Users List (Windows)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/users" | ConvertTo-Json -Depth 4
```

## 📋 Current Users in Database

Based on the latest data, your MongoDB contains **3 registered users**:

### 1. arshad karim
- **Email**: arshadkarim@gmail.com
- **Phone**: 07510773622
- **Role**: user
- **Created**: 2025-08-07 19:47:17
- **ID**: 689502c5297c371940973f45

### 2. Test User
- **Email**: test@example.com
- **Phone**: 1234567890
- **Role**: user
- **Created**: 2025-08-13 17:41:38
- **ID**: 689cce529d489d98c5a9f5e6

### 3. linsha nadhir
- **Email**: linsha@gmail.com
- **Phone**: 72727727272
- **Role**: user
- **Created**: 2025-08-13 18:08:36
- **ID**: 689cd4a49d489d98c5a9f5e7

## 🔧 MongoDB Configuration

### Connection Details
- **Host**: localhost
- **Port**: 27017
- **Database**: greencart
- **Collection**: users
- **Authentication**: None (local development)

### Database Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  phone: String (required),
  created_at: Date,
  role: String (default: "user")
}
```

## 🚀 Quick Start Guide

### To View Database Status:
1. **Web Dashboard**: Go to http://localhost:3000/db-status
2. **API Call**: `curl http://localhost:5000/api/db-status`
3. **Python Script**: `python backend/show_db_info.py`

### To Test Authentication:
1. **Register**: Go to http://localhost:3000/signup
2. **Login**: Go to http://localhost:3000/login
3. **Dashboard**: View user info at http://localhost:3000/dashboard

### To Monitor in Real-time:
1. Open the web dashboard: http://localhost:3000/db-status
2. Click "Refresh" to get latest data
3. Switch between "Database Info" and "Users" tabs

## 🛠️ Troubleshooting

### MongoDB Not Connected?
1. **Check MongoDB Service**:
   ```bash
   Get-Service | Where-Object {$_.Name -like "*mongo*"}
   ```

2. **Start MongoDB Service**:
   ```bash
   net start MongoDB
   ```

3. **Test Connection**:
   ```bash
   curl http://localhost:5000/api/db-status
   ```

### Backend Not Running?
1. **Start Flask Backend**:
   ```bash
   cd backend
   python app.py
   ```

2. **Check Backend Status**:
   ```bash
   curl http://localhost:5000
   ```

### Frontend Not Running?
1. **Start React Frontend**:
   ```bash
   cd frontend
   npm start
   ```

2. **Access Application**:
   - Main App: http://localhost:3000
   - Database Dashboard: http://localhost:3000/db-status

## 📈 Monitoring Best Practices

### Regular Checks
- Monitor user registration growth
- Check database size and performance
- Verify connection stability
- Review user activity logs

### Security Considerations
- Passwords are properly hashed
- JWT tokens are secure
- API endpoints are protected
- User data is validated

### Performance Monitoring
- Database response times
- Connection pool status
- Query performance
- Memory usage

## 🎯 Next Steps

### Recommended Enhancements
1. **MongoDB Compass**: Install for visual database management
2. **Monitoring Tools**: Add database performance monitoring
3. **Backup Strategy**: Implement regular database backups
4. **Indexing**: Add database indexes for better performance
5. **Logging**: Enhanced database operation logging

### Production Considerations
1. **Authentication**: Add MongoDB authentication
2. **SSL/TLS**: Enable encrypted connections
3. **Replica Sets**: Configure for high availability
4. **Monitoring**: Professional monitoring solutions
5. **Backup**: Automated backup strategies

---

**🎉 Your MongoDB connection is working perfectly!** 

You now have multiple ways to view and monitor your database. The web dashboard at http://localhost:3000/db-status provides the most user-friendly interface for monitoring your MongoDB connection and user data.