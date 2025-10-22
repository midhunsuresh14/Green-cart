#!/usr/bin/env python3
"""
Test script to verify environment variables are loaded correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_env_vars():
    """Test that environment variables are loaded correctly"""
    print("Testing environment variables...")
    
    # Test SECRET_KEY
    secret_key = os.getenv('SECRET_KEY')
    if secret_key:
        print(f"✅ SECRET_KEY loaded: {secret_key[:10]}...{secret_key[-10:]}")
    else:
        print("❌ SECRET_KEY not found")
    
    # Test MONGO_URI
    mongo_uri = os.getenv('MONGO_URI')
    if mongo_uri:
        print(f"✅ MONGO_URI loaded: {mongo_uri}")
    else:
        print("❌ MONGO_URI not found")
    
    # Test EMAIL configuration
    email_host = os.getenv('EMAIL_HOST')
    email_username = os.getenv('EMAIL_USERNAME')
    if email_host and email_username:
        print(f"✅ Email config loaded: {email_host} with user {email_username}")
    else:
        print("⚠️  Email config not fully configured")
    
    print("\nAll environment variables tested!")

if __name__ == "__main__":
    test_env_vars()