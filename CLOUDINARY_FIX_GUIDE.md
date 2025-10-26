# Cloudinary Configuration Fix

## Problem
Your application is showing this error:
```
Cloudinary is not configured. Please set up Cloudinary credentials in .env file.
```

## Solution

### Step 1: Create a .env file in the backend directory

Create a file named `.env` in the `backend` directory with the following content:

```env
# Cloudinary Configuration
# Get these values from your Cloudinary dashboard: https://cloudinary.com/console
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/greencart

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=GreenCart

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key
```

### Step 2: Get Cloudinary Credentials

1. Go to [https://cloudinary.com](https://cloudinary.com) and create a free account
2. After logging in, go to your dashboard
3. Copy the following values from your dashboard:
   - **Cloud Name** (replace `your_cloudinary_cloud_name`)
   - **API Key** (replace `your_cloudinary_api_key`)
   - **API Secret** (replace `your_cloudinary_api_secret`)

### Step 3: Update the .env file

Replace the placeholder values in your `.env` file with your actual Cloudinary credentials:

```env
CLOUD_NAME=your_actual_cloud_name
CLOUD_API_KEY=your_actual_api_key
CLOUD_API_SECRET=your_actual_api_secret
```

### Step 4: Restart your backend server

After creating the `.env` file with the correct credentials, restart your backend server:

```bash
cd backend
python app.py
```

### Step 5: Test the image upload

Try uploading an image again in your application. The error should be resolved.

## Alternative: Quick Test

If you want to test without setting up Cloudinary immediately, you can temporarily disable the Cloudinary requirement by modifying the backend code, but this is not recommended for production.

## Verification

You can verify that your environment variables are loaded correctly by running:

```bash
cd backend
python test_env.py
```

This will show you which environment variables are properly configured.

