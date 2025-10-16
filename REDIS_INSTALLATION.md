# Redis Installation Guide for GreenCart

## Windows Installation

### Option 1: Using Windows Subsystem for Linux (WSL) - Recommended

1. Install WSL2 if you haven't already:
   ```powershell
   wsl --install
   ```

2. Install Ubuntu from the Microsoft Store

3. Open Ubuntu and install Redis:
   ```bash
   sudo apt update
   sudo apt install redis-server
   ```

4. Start Redis:
   ```bash
   sudo service redis-server start
   ```

5. Test Redis:
   ```bash
   redis-cli ping
   ```
   You should see "PONG" as the response.

### Option 2: Using Docker

1. Install Docker Desktop for Windows

2. Run Redis container:
   ```bash
   docker run -d -p 6379:6379 --name redis redis:alpine
   ```

3. Test Redis:
   ```bash
   docker exec -it redis redis-cli ping
   ```
   You should see "PONG" as the response.

### Option 3: Using Redis for Windows (Unofficial)

1. Download Redis for Windows from: https://github.com/tporadowski/redis/releases

2. Extract the files to a folder (e.g., `C:\redis`)

3. Open Command Prompt as Administrator and navigate to the Redis folder:
   ```cmd
   cd C:\redis
   ```

4. Start Redis server:
   ```cmd
   redis-server.exe
   ```

5. Test Redis by opening another Command Prompt window:
   ```cmd
   redis-cli.exe ping
   ```
   You should see "PONG" as the response.

## macOS Installation

1. Install Homebrew if you don't have it:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Redis:
   ```bash
   brew install redis
   ```

3. Start Redis:
   ```bash
   brew services start redis
   ```
   or
   ```bash
   redis-server
   ```

4. Test Redis:
   ```bash
   redis-cli ping
   ```
   You should see "PONG" as the response.

## Linux Installation (Ubuntu/Debian)

1. Update package list:
   ```bash
   sudo apt update
   ```

2. Install Redis:
   ```bash
   sudo apt install redis-server
   ```

3. Start Redis:
   ```bash
   sudo systemctl start redis
   ```

4. Enable Redis to start on boot:
   ```bash
   sudo systemctl enable redis
   ```

5. Test Redis:
   ```bash
   redis-cli ping
   ```
   You should see "PONG" as the response.

## Verifying Installation

After installing Redis, you can verify it's working properly:

1. Start Redis server (if not already running)

2. Open a new terminal/command prompt and run:
   ```bash
   redis-cli ping
   ```

3. If you see "PONG", Redis is running correctly

4. You can also check Redis info:
   ```bash
   redis-cli info
   ```

## Starting Redis Automatically

### Windows (Option 3 - Redis for Windows)

1. Install Redis as a Windows service:
   ```cmd
   redis-server.exe --service-install
   ```

2. Start the service:
   ```cmd
   redis-server.exe --service-start
   ```

### macOS

```bash
brew services start redis
```

### Linux

```bash
sudo systemctl enable redis
sudo systemctl start redis
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Redis default port (6379) might be occupied
   - Change the port in redis.conf
   - Or stop the process using that port

2. **Permission denied**: Run terminal as administrator (Windows) or use sudo (macOS/Linux)

3. **Connection refused**: Make sure Redis server is running

### Testing Connection

To test if your application can connect to Redis:

1. Make sure Redis server is running

2. In your Python application:
   ```python
   import redis
   
   try:
       r = redis.Redis(host='localhost', port=6379, db=0)
       r.ping()
       print("Connected to Redis successfully!")
   except Exception as e:
       print(f"Could not connect to Redis: {e}")
   ```

## Configuration

The Redis configuration file is typically located at:
- Windows: `redis.windows.conf` in the Redis installation directory
- macOS: `/usr/local/etc/redis.conf`
- Linux: `/etc/redis/redis.conf`

Common configuration changes:
- Change port: `port 6379`
- Bind to specific IP: `bind 127.0.0.1`
- Set password: `requirepass yourpassword`
- Max memory: `maxmemory 256mb`

After changing the configuration, restart Redis for changes to take effect.