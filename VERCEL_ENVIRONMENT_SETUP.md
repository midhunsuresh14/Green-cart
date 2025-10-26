# Vercel Environment Variables Setup Guide

## Problem
You're seeing these errors:
- "Cloudinary is not configured. Please set up Cloudinary credentials in .env file."
- "AI feature disabled"

## Root Cause
Vercel doesn't automatically read `.env` files from your repository. You need to manually configure environment variables in the Vercel dashboard.

## Solution

### Step 1: Access Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your GreenCart backend project
3. Click on your project to open it

### Step 2: Configure Environment Variables
1. In your project dashboard, go to **Settings** tab
2. Click on **Environment Variables** in the left sidebar
3. Add the following variables one by one:

#### Required Variables for Cloudinary:
```
Name: CLOUD_NAME
Value: your_actual_cloudinary_cloud_name

Name: CLOUD_API_KEY  
Value: your_actual_cloudinary_api_key

Name: CLOUD_API_SECRET
Value: your_actual_cloudinary_api_secret
```

#### Required Variables for AI Chatbot:
```
Name: MISTRAL_API_KEY
Value: your_mistral_api_key_here
```
OR
```
Name: OPENAI_API_KEY
Value: sk-your_openai_api_key_here
```

#### Other Required Variables:
```
Name: MONGO_URI
Value: your_mongodb_connection_string

Name: SECRET_KEY
Value: your_jwt_secret_key

Name: JWT_SECRET
Value: your_jwt_secret_key
```

### Step 3: Get Your API Keys

#### For Cloudinary:
1. Go to [https://cloudinary.com/console](https://cloudinary.com/console)
2. Sign up for a free account if you haven't already
3. Copy your:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

#### For AI Chatbot (choose one):
**Option A - Mistral (Recommended):**
1. Go to [https://console.mistral.ai/](https://console.mistral.ai/)
2. Sign up and get your API key

**Option B - OpenAI:**
1. Go to [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up and get your API key (starts with `sk-`)

### Step 4: Redeploy Your Application
After adding all environment variables:
1. Go to the **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment
3. Or push a new commit to trigger automatic redeployment

### Step 5: Verify Configuration
After redeployment, test your endpoints:

#### Test Cloudinary:
```bash
curl -X POST https://your-backend-url.vercel.app/api/cloudinary-upload \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="}'
```

#### Test AI Chatbot:
```bash
curl -X POST https://your-backend-url.vercel.app/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "history": []}'
```

## Important Notes

1. **Environment Variables are Case Sensitive** - Make sure to use exact names as shown above
2. **No Spaces Around =** - Don't add spaces around the equals sign in Vercel
3. **Redeploy Required** - Changes to environment variables require a redeployment
4. **Security** - Never commit API keys to your repository

## Troubleshooting

### Still Getting Cloudinary Error?
1. Double-check that all three Cloudinary variables are set in Vercel
2. Verify the values are correct (no extra spaces or characters)
3. Redeploy your application
4. Check the Vercel function logs for detailed error messages

### AI Feature Still Disabled?
1. Make sure either `MISTRAL_API_KEY` or `OPENAI_API_KEY` is set
2. Verify the API key is valid and has credits
3. Check that the variable name is exactly as shown above
4. Redeploy after adding the variable

### Check Your Current Environment Variables
You can add a temporary endpoint to check what environment variables are loaded:

```python
@app.route('/api/debug-env', methods=['GET'])
def debug_env():
    return jsonify({
        'CLOUD_NAME': bool(os.getenv('CLOUD_NAME')),
        'CLOUD_API_KEY': bool(os.getenv('CLOUD_API_KEY')),
        'CLOUD_API_SECRET': bool(os.getenv('CLOUD_API_SECRET')),
        'MISTRAL_API_KEY': bool(os.getenv('MISTRAL_API_KEY')),
        'OPENAI_API_KEY': bool(os.getenv('OPENAI_API_KEY')),
        'MONGO_URI': bool(os.getenv('MONGO_URI'))
    })
```

Then visit: `https://your-backend-url.vercel.app/api/debug-env`

## Quick Checklist

- [ ] CLOUD_NAME set in Vercel
- [ ] CLOUD_API_KEY set in Vercel  
- [ ] CLOUD_API_SECRET set in Vercel
- [ ] MISTRAL_API_KEY or OPENAI_API_KEY set in Vercel
- [ ] MONGO_URI set in Vercel
- [ ] SECRET_KEY set in Vercel
- [ ] Application redeployed after adding variables
- [ ] Tested image upload functionality
- [ ] Tested AI chatbot functionality

