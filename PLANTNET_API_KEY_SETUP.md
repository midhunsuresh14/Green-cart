# PlantNet API Key Setup Guide

## Step 1: Get Your Free PlantNet API Key

1. **Visit PlantNet API Website**
   - Go to: https://my.plantnet.org/
   - Click on "Sign up" or "Create account" (if you don't have an account)
   - Or log in if you already have an account

2. **Create Account** (if needed)
   - Fill in your email address
   - Choose a password
   - Complete the registration

3. **Generate API Key**
   - After logging in, go to your dashboard
   - Look for "API Keys" or "My API Keys" section
   - Click "Generate new API key" or "Create API key"
   - Copy the API key (it will look something like: `2b10Xxxxxxxxxxxxxxxxxxxxxx`)

## Step 2: Add API Key to Your Project

### Option A: Using .env File (Recommended for Local Development)

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create or edit the .env file**
   
   **Windows (PowerShell):**
   ```powershell
   # If file doesn't exist, create it
   if (!(Test-Path .env)) { New-Item -ItemType File -Path .env }
   # Open in notepad
   notepad .env
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   # Create file if it doesn't exist
   type nul > .env
   # Open in notepad
   notepad .env
   ```
   
   **Mac/Linux:**
   ```bash
   # Create file if it doesn't exist
   touch .env
   # Open in your editor
   nano .env
   # or
   code .env  # if you have VS Code
   ```

3. **Add the API key to .env file**
   
   Open the `.env` file and add this line:
   ```env
   PLANTNET_API_KEY=your_actual_api_key_here
   ```
   
   **Example:**
   ```env
   PLANTNET_API_KEY=2b10Xxxxxxxxxxxxxxxxxxxxxx
   ```
   
   **Important Notes:**
   - Replace `your_actual_api_key_here` with your actual API key from PlantNet
   - Do NOT put quotes around the API key
   - Do NOT add spaces before or after the `=` sign
   - Make sure there are no extra spaces in the key

4. **Save the file**

### Option B: Set Environment Variable Directly (Temporary)

**Windows (PowerShell):**
```powershell
$env:PLANTNET_API_KEY="your_actual_api_key_here"
```

**Windows (Command Prompt):**
```cmd
set PLANTNET_API_KEY=your_actual_api_key_here
```

**Mac/Linux:**
```bash
export PLANTNET_API_KEY="your_actual_api_key_here"
```

**Note:** This method only works for the current terminal session. Use Option A for permanent setup.

## Step 3: Verify the Setup

1. **Check if the .env file exists and has the key**
   
   **Windows (PowerShell):**
   ```powershell
   Get-Content .env | Select-String "PLANTNET"
   ```
   
   **Mac/Linux:**
   ```bash
   grep PLANTNET .env
   ```

2. **Test the environment variable** (optional)
   
   Create a test file `test_plantnet_key.py` in the backend directory:
   ```python
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   
   api_key = os.getenv('PLANTNET_API_KEY', '').strip()
   
   if api_key:
       print(f"✅ PlantNet API Key loaded: {api_key[:10]}...{api_key[-5:]}")
   else:
       print("❌ PlantNet API Key not found!")
   ```
   
   Run it:
   ```bash
   python test_plantnet_key.py
   ```

## Step 4: Restart Your Backend Server

**IMPORTANT:** You must restart your backend server after adding the API key!

1. **Stop the current server**
   - If running in terminal, press `Ctrl+C`
   - If running as a service, stop it

2. **Start the server again**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Start Flask server (adjust command based on how you run it)
   python app.py
   # or
   flask run
   # or
   python -m flask run
   ```

3. **Verify it's working**
   - Check the server console for any errors
   - Try uploading a plant photo in the frontend
   - The error should be gone!

## Troubleshooting

### Problem: Still getting "API key not configured" error

**Solutions:**
1. ✅ Make sure the `.env` file is in the `backend` directory (not root directory)
2. ✅ Check the file name is exactly `.env` (not `.env.txt` or `env`)
3. ✅ Verify the API key has no quotes: `PLANTNET_API_KEY=key` not `PLANTNET_API_KEY="key"`
4. ✅ Make sure there are no spaces: `PLANTNET_API_KEY=key` not `PLANTNET_API_KEY = key`
5. ✅ Restart the backend server after making changes
6. ✅ Check if `python-dotenv` is installed: `pip install python-dotenv`

### Problem: "Invalid API key" or 401 error

**Solutions:**
1. ✅ Verify the API key is correct (copy it again from PlantNet dashboard)
2. ✅ Make sure the API key hasn't expired (check PlantNet dashboard)
3. ✅ Ensure there are no extra characters or spaces

### Problem: Can't find .env file

**Solutions:**
1. ✅ Make sure you're in the `backend` directory
2. ✅ Hidden files might not be visible - enable "Show hidden files" in your file explorer
3. ✅ Create the file manually if it doesn't exist

## Example .env File Structure

Your `.env` file in the `backend` directory should look something like this:

```env
# Database
MONGO_URI=mongodb://localhost:27017/

# JWT Secret
SECRET_KEY=your-secret-key-here

# PlantNet API Key
PLANTNET_API_KEY=2b10Xxxxxxxxxxxxxxxxxxxxxx

# Cloudinary (if using)
CLOUD_NAME=your-cloud-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret

# Other environment variables...
```

## Quick Checklist

- [ ] Got API key from https://my.plantnet.org/
- [ ] Created/edited `.env` file in `backend` directory
- [ ] Added `PLANTNET_API_KEY=your_key` (no quotes, no spaces)
- [ ] Saved the `.env` file
- [ ] Restarted backend server
- [ ] Tested plant identification feature

## Need Help?

If you're still having issues:
1. Check the backend server console for error messages
2. Verify the `.env` file location and contents
3. Make sure `python-dotenv` is installed: `pip install python-dotenv`
4. Try setting the environment variable directly in your terminal before starting the server

