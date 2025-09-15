# OTP Email Verification Setup

## Overview
The GreenCart application now includes OTP (One-Time Password) email verification for user signup. This ensures that users verify their email addresses before their accounts are created.

## Environment Configuration

The `.env` file has been created with the following email configuration variables:

```env
# Email Configuration (for OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=GreenCart

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
```

## Setup Instructions

### 1. Gmail Setup (Recommended)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASSWORD` (not your regular Gmail password)

### 2. Update .env File
Replace the placeholder values in `backend/.env`:
- `EMAIL_USERNAME`: Your Gmail address
- `EMAIL_PASSWORD`: Your Gmail app password (not regular password)

### 3. Alternative Email Providers
You can use other SMTP providers by updating these variables:
- `EMAIL_HOST`: SMTP server (e.g., smtp.outlook.com for Outlook)
- `EMAIL_PORT`: Port number (587 for TLS, 465 for SSL)
- `EMAIL_USE_TLS`: true/false

## How It Works

### Signup Flow
1. User fills out signup form
2. System generates 6-digit OTP
3. OTP is stored in database with 10-minute expiry
4. Verification email is sent to user
5. User enters OTP to complete registration
6. Account is created only after successful OTP verification

### API Endpoints
- `POST /api/signup` - Initiates signup and sends OTP
- `POST /api/verify-otp` - Verifies OTP and creates account
- `POST /api/resend-otp` - Resends OTP if needed

### Database Collections
- `users` - User accounts (with `email_verified: true` flag)
- `otp_verifications` - Temporary OTP storage with expiry

## Testing

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Try signing up with a valid email address
4. Check your email for the OTP
5. Enter the OTP to complete registration

## Security Features

- OTPs expire after 10 minutes
- OTPs are single-use (marked as used after verification)
- Old OTPs are automatically deleted when new ones are generated
- Email addresses are validated before sending OTPs
- Rate limiting can be added to prevent spam

## Troubleshooting

### Email Not Sending
1. Check your email credentials in `.env`
2. Ensure 2FA is enabled and app password is used
3. Check firewall/antivirus settings
4. Verify SMTP settings for your email provider

### OTP Not Working
1. Check if OTP has expired (10 minutes)
2. Ensure OTP is exactly 6 digits
3. Check database connection
4. Verify OTP hasn't been used already

### Frontend Issues
1. Ensure backend is running on port 5000
2. Check browser console for errors
3. Verify API endpoints are accessible


