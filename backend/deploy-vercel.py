#!/usr/bin/env python3
"""
Helper script for deploying to Vercel
This script provides guidance and checks for Vercel deployment
"""

import os
import sys

def check_deployment_files():
    """Check if all required files for Vercel deployment exist"""
    required_files = [
        'vercel.json',
        'index.py',
        'app.py',
        'requirements.txt'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("❌ Missing required files for Vercel deployment:")
        for file in missing_files:
            print(f"  - {file}")
        return False
    
    print("✅ All required files for Vercel deployment are present")
    return True

def check_environment_variables():
    """Check if recommended environment variables are set"""
    recommended_vars = [
        'MONGO_URI',
        'SECRET_KEY'
    ]
    
    missing_vars = []
    for var in recommended_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("⚠️  Recommended environment variables not set:")
        for var in missing_vars:
            print(f"  - {var}")
        return False
    
    print("✅ All recommended environment variables are set")
    return True

def main():
    print("GreenCart Vercel Deployment Checker")
    print("=" * 40)
    
    # Change to backend directory if not already there
    if not os.path.exists('app.py'):
        os.chdir('backend')
        print("Changed to backend directory")
    
    files_ok = check_deployment_files()
    env_ok = check_environment_variables()
    
    if files_ok:
        print("\n✅ Ready for Vercel deployment!")
        print("\nDeployment steps:")
        print("1. Push your code to a GitHub repository")
        print("2. Connect the repository to Vercel")
        print("3. Set the root directory to '/backend' in Vercel project settings")
        print("4. Add the required environment variables in Vercel dashboard")
        print("5. Deploy!")
    else:
        print("\n❌ Please fix the missing files before deploying")
        sys.exit(1)

if __name__ == "__main__":
    main()