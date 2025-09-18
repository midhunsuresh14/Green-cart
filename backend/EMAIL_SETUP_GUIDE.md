# Email Setup Guide for GreenCart OTP Verification

## 🚨 Current Issue
The email verification is failing because the `.env` file contains placeholder values instead of actual email credentials.

## 📧 Email Configuration Options

### Option 1: Gmail (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

#### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Generate a 16-character password
4. Copy this password (you'll need it for the .env file)

#### Step 3: Update .env File
Replace the placeholder values in `backend/.env`:

```env
EMAIL_USERNAME=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

### Option 2: Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USERNAME=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

### Option 3: Yahoo Mail

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USERNAME=your-email@yahoo.com
EMAIL_PASSWORD=your-yahoo-app-password
```

## 🔧 Testing Email Configuration

### Step 1: Update .env File
1. Open `backend/.env`
2. Replace `YOUR_ACTUAL_EMAIL@gmail.com` with your real email
3. Replace `YOUR_GMAIL_APP_PASSWORD` with your Gmail app password

### Step 2: Test Email Sending
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

3. Try signing up with a test email address
4. Check if you receive the OTP email

## 🐛 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check if 2FA is enabled
   - Verify you're using App Password, not regular password
   - Ensure email address is correct

2. **"Connection refused"**
   - Check if EMAIL_HOST and EMAIL_PORT are correct
   - Verify EMAIL_USE_TLS is set to True

3. **"SMTP server not found"**
   - Double-check the EMAIL_HOST value
   - Try different SMTP servers for your email provider

### Debug Steps:

1. **Check .env file**:
   ```bash
   Get-Content .env
   ```

2. **Test with a simple email**:
   - Use a test email address
   - Check spam folder
   - Verify email address format

3. **Check backend logs**:
   - Look for error messages in the terminal
   - Check if Flask-Mail is properly configured

## 📝 Example Working Configuration

For Gmail, your `.env` should look like this:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USERNAME=myemail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=GreenCart
```

**Important**: 
- Use your actual Gmail address
- Use the 16-character app password (with spaces removed)
- Never use your regular Gmail password

## 🚀 Quick Fix

1. **Get Gmail App Password**:
   - Go to Google Account → Security → App passwords
   - Generate password for "Mail"

2. **Update .env**:
   ```bash
   # Edit backend/.env file
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password-here
   ```

3. **Restart servers**:
   ```bash
   # Backend
   cd backend
   python app.py
   
   # Frontend (new terminal)
   cd frontend
   npm start
   ```

4. **Test signup** with a real email address!

## 📞 Need Help?

If you're still having issues:
1. Check the backend terminal for error messages
2. Verify your email credentials
3. Try a different email provider
4. Check your internet connection





