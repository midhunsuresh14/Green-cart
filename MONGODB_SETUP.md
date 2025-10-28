# MongoDB Setup Guide

## Option 1: Install MongoDB Community Server (Local)

### Windows Installation:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Choose Windows as your platform and download the MSI installer
3. Run the installer with default settings
4. During installation, make sure to check:
   - "Install MongoDB as a Service" (this will automatically start MongoDB)
   - "Run service as Network Service user"

### Start MongoDB Service:
- If installed as a service, MongoDB should start automatically
- You can verify by opening a new terminal and running:
  ```
  net start MongoDB
  ```

### Connect to MongoDB:
- Default connection string: `mongodb://localhost:27017/`

## Option 2: Use MongoDB Atlas (Cloud - Recommended)

### Setup MongoDB Atlas:
1. Go to https://www.mongodb.com/cloud/atlas and create a free account
2. Create a new project
3. Build a new cluster (choose the free tier)
4. Configure cluster settings:
   - Provider: AWS, GCP, or Azure
   - Region: Choose the closest to you
   - Cluster Tier: M0 Sandbox (Free forever)

### Configure Database Access:
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a new user with:
   - Username: your preferred username
   - Password: a strong password
   - Built-in Role: "Read and write to any database"

### Configure Network Access:
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, you can add "Access from anywhere" (0.0.0.0/0)
4. For production, add only your specific IP address

### Get Connection String:
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. Update your .env file with this connection string

## Update Your .env File

After setting up MongoDB, update your backend/.env file:

### For Local MongoDB:
```
MONGO_URI=mongodb://localhost:27017/
DB_NAME=greencart
```

### For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://your_username:your_password@your-cluster.mongodb.net/greencart?retryWrites=true&w=majority
DB_NAME=greencart
```

## Initialize Database

After MongoDB is running, you need to initialize your database:

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the seed script:
   ```
   python seed.py
   ```

3. Create an admin user:
   ```
   python create_admin_user.py
   ```

## Troubleshooting

### Common Issues:

1. **Connection Refused (10061)**:
   - MongoDB service is not running
   - Check if MongoDB is installed and running as a service
   - Try: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux)

2. **Authentication Failed**:
   - Check your username and password in the connection string
   - Ensure the database user has proper permissions

3. **Network Issues with Atlas**:
   - Check your IP whitelist in Network Access settings
   - Ensure your internet connection is working

### Verify Connection:

You can test your MongoDB connection with this simple Python script:

```python
from pymongo import MongoClient

# Replace with your actual connection string
client = MongoClient("mongodb://localhost:27017/")
# Or for Atlas:
# client = MongoClient("mongodb+srv://username:password@cluster.mongodb.net/")

try:
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("MongoDB connection successful!")
except Exception as e:
    print("MongoDB connection failed:", e)
```