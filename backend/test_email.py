#!/usr/bin/env python3
"""
Email Configuration Test Script
Run this to test if your email settings are working correctly.
"""

import os
import sys
from dotenv import load_dotenv
from flask import Flask
from flask_mail import Mail, Message

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('EMAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = (os.getenv('EMAIL_FROM_NAME', 'GreenCart'), os.getenv('EMAIL_USERNAME'))

# Initialize Mail
mail = Mail(app)

def test_email_config():
    """Test email configuration and send a test email."""
    
    print("🔍 Testing Email Configuration...")
    print("=" * 50)
    
    # Check configuration
    print(f"SMTP Host: {app.config['MAIL_SERVER']}")
    print(f"SMTP Port: {app.config['MAIL_PORT']}")
    print(f"Use TLS: {app.config['MAIL_USE_TLS']}")
    print(f"Username: {app.config['MAIL_USERNAME']}")
    print(f"Password: {'*' * len(app.config['MAIL_PASSWORD']) if app.config['MAIL_PASSWORD'] else 'NOT SET'}")
    print(f"From Name: {app.config['MAIL_DEFAULT_SENDER'][0]}")
    print()
    
    # Validate configuration
    if not app.config['MAIL_USERNAME'] or app.config['MAIL_USERNAME'] == 'your-email@gmail.com':
        print("❌ ERROR: EMAIL_USERNAME is not set or still has placeholder value")
        print("   Please update your .env file with your actual email address")
        return False
    
    if not app.config['MAIL_PASSWORD'] or app.config['MAIL_PASSWORD'] == 'your-app-password':
        print("❌ ERROR: EMAIL_PASSWORD is not set or still has placeholder value")
        print("   Please update your .env file with your email app password")
        return False
    
    # Test email sending
    try:
        print("📧 Sending test email...")
        
        with app.app_context():
            msg = Message(
                subject='GreenCart Email Test',
                recipients=[app.config['MAIL_USERNAME']],  # Send to yourself
                html='''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">GreenCart Email Test</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">✅ Email Configuration Successful!</h2>
                        <p style="color: #666; font-size: 16px;">
                            Your email settings are working correctly. You can now use OTP verification in your GreenCart application.
                        </p>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4CAF50;">
                            <h3 style="color: #4CAF50; margin: 0;">Test Details</h3>
                            <p style="margin: 10px 0;"><strong>SMTP Host:</strong> {}</p>
                            <p style="margin: 10px 0;"><strong>SMTP Port:</strong> {}</p>
                            <p style="margin: 10px 0;"><strong>Use TLS:</strong> {}</p>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            This is a test email from your GreenCart application.
                        </p>
                    </div>
                    <div style="background: #333; padding: 20px; text-align: center;">
                        <p style="color: #ccc; margin: 0; font-size: 12px;">
                            © 2024 GreenCart. All rights reserved.
                        </p>
                    </div>
                </div>
                '''.format(
                    app.config['MAIL_SERVER'],
                    app.config['MAIL_PORT'],
                    app.config['MAIL_USE_TLS']
                )
            )
            
            mail.send(msg)
            print("✅ SUCCESS: Test email sent successfully!")
            print(f"   Check your inbox at: {app.config['MAIL_USERNAME']}")
            print("   (Also check spam folder if you don't see it)")
            return True
            
    except Exception as e:
        print(f"❌ ERROR: Failed to send test email")
        print(f"   Error: {str(e)}")
        print()
        print("🔧 Troubleshooting:")
        print("   1. Check if EMAIL_USERNAME and EMAIL_PASSWORD are correct")
        print("   2. For Gmail, make sure you're using an App Password, not your regular password")
        print("   3. Ensure 2-Factor Authentication is enabled")
        print("   4. Check your internet connection")
        return False

if __name__ == '__main__':
    print("GreenCart Email Configuration Test")
    print("=" * 50)
    
    success = test_email_config()
    
    print()
    print("=" * 50)
    if success:
        print("🎉 Email configuration is working! You can now use OTP verification.")
    else:
        print("❌ Email configuration needs to be fixed. Please check the errors above.")
    
    print()
    print("📖 For detailed setup instructions, see: EMAIL_SETUP_GUIDE.md")


