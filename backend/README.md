# GreenCart Backend - Vercel Deployment

This document explains how to deploy the GreenCart backend to Vercel.

## Prerequisites

1. A Vercel account
2. MongoDB database (MongoDB Atlas recommended)
3. Environment variables configured in Vercel

## Deployment Steps

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set the root directory to `/backend` in Vercel project settings
4. Add the required environment variables in Vercel dashboard

## Required Environment Variables

- `MONGO_URI` - MongoDB connection string
- `SECRET_KEY` - Secret key for JWT tokens (generate a secure one)
- `EMAIL_USERNAME` - Email for sending OTPs
- `EMAIL_PASSWORD` - Password for email account
- `RAZORPAY_KEY_ID` - Razorpay API key (optional)
- `RAZORPAY_KEY_SECRET` - Razorpay API secret (optional)

## Generating a Secure SECRET_KEY

You can generate a secure secret key using Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Vercel Configuration

The `vercel.json` file in this directory configures the deployment:
- Uses the Python runtime
- Points to `index.py` as the entrypoint
- Routes all requests to the Flask app

## Health Check Endpoint

A health check endpoint is available at `/health` to verify the deployment is working correctly.

# GreenCart Backend

This is the Flask backend for the GreenCart application with MongoDB integration.

## Setup Instructions

1. **Install MongoDB**
   - Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud service)
   - Make sure MongoDB is running on `localhost:27017`

2. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure MongoDB**
   - The application will automatically create the `greencart` database and `users` collection
   - Default connection: `mongodb://localhost:27017/`

4. **Set Secret Key**
   - Update the `SECRET_KEY` in `app.py` with a secure secret key for JWT tokens

5. **Run the Backend**
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:5000`

## API Endpoints

- `POST /api/signup` - Create a new user account with name, email, phone, and password
- `POST /api/login` - Authenticate user and return JWT token
- `GET /api/user/<user_id>` - Get user data by user ID
- `POST /api/chatbot` - AI-powered chatbot endpoint

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "hashed_string",
  "name": "string",
  "phone": "string",
  "created_at": "datetime",
  "role": "string"
}
```

## Security Features

- Password hashing using Werkzeug
- JWT token authentication
- Email validation
- Phone number validation 

## AI Chatbot Integration

GreenCart now includes an enhanced AI-powered chatbot that provides intelligent assistance for customer inquiries about herbal remedies and products.

### Features:
- Real-time data integration with current inventory
- Context-aware responses about health conditions and products
- Fallback system for when AI is not configured
- Specialized knowledge about herbal remedies

### Setup:
1. Sign up for an OpenAI API key at [platform.openai.com](https://platform.openai.com/)
2. Add your API key to the `.env` file:
   ```env
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ```
3. Restart the backend server

The chatbot is accessible through the floating chat icon on the frontend and provides intelligent assistance for:
- Herbal remedies for specific health conditions
- Product information and availability
- Ordering and delivery process
- General customer support

### Without API Key:
The chatbot works perfectly without an API key, using a comprehensive rule-based system that:
- Recognizes common health conditions and suggests relevant remedies
- Provides detailed product information
- Handles general customer service inquiries

## SMS (Twilio) Configuration

Phone OTP endpoints are available but require Twilio credentials to send messages.

1. Create/Update `.env` in `backend/`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+15551234567
# Optional: set a default country code for local numbers (e.g., 1 for US/CA)
DEFAULT_COUNTRY_CODE=1
```

2. Install dependencies (already listed):

```bash
pip install -r requirements.txt
```

3. Test your credentials by sending a message:

```bash
cd backend
python test_sms.py "+15551234567" "Hello from GreenCart"
```

4. Request an OTP via API (for an existing user phone):

```bash
curl -X POST http://localhost:5000/api/phone/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+15551234567"}'
```

5. Verify the OTP you receive:

```bash
curl -X POST http://localhost:5000/api/phone/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+15551234567", "otp": "123456"}'
```

See `SMS_SETUP.md` for details and troubleshooting.