#!/usr/bin/env python3
"""
Email Setup Helper Script
This script will help you configure your email settings interactively.
"""

import os
import re

def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def main():
    print("🔧 GreenCart Email Setup Helper")
    print("=" * 50)
    print()
    
    print("This script will help you configure email settings for OTP verification.")
    print()
    
    # Get email address
    while True:
        email = input("Enter your Gmail address: ").strip()
        if validate_email(email):
            break
        print("❌ Invalid email format. Please enter a valid Gmail address.")
    
    print()
    print("📧 Gmail App Password Setup:")
    print("1. Go to: https://myaccount.google.com/security")
    print("2. Enable 2-Step Verification if not already enabled")
    print("3. Go to: https://myaccount.google.com/apppasswords")
    print("4. Select 'Mail' and generate a 16-character password")
    print("5. Copy the password (it looks like: abcd efgh ijkl mnop)")
    print()
    
    # Get app password
    while True:
        password = input("Enter your Gmail App Password: ").strip()
        if len(password) >= 16:
            # Remove spaces if any
            password = password.replace(' ', '')
            break
        print("❌ App password should be at least 16 characters. Please try again.")
    
    print()
    print("📝 Updating .env file...")
    
    # Read current .env file
    env_path = '.env'
    if not os.path.exists(env_path):
        print("❌ .env file not found!")
        return
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Replace placeholder values
    content = content.replace('YOUR_ACTUAL_EMAIL@gmail.com', email)
    content = content.replace('YOUR_GMAIL_APP_PASSWORD', password)
    
    # Write updated content
    with open(env_path, 'w') as f:
        f.write(content)
    
    print("✅ .env file updated successfully!")
    print()
    print("🧪 Testing email configuration...")
    
    # Test the configuration
    try:
        from test_email import test_email_config
        success = test_email_config()
        
        if success:
            print()
            print("🎉 SUCCESS! Email configuration is working!")
            print("   You can now use OTP verification in your GreenCart app.")
        else:
            print()
            print("❌ Email test failed. Please check your credentials.")
            
    except Exception as e:
        print(f"❌ Error testing email: {e}")
    
    print()
    print("📖 For more help, see: EMAIL_SETUP_GUIDE.md")

if __name__ == '__main__':
    main()





