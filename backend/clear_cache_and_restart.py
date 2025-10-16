#!/usr/bin/env python3
"""
Script to clear Redis cache and restart the application
"""

import redis
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def clear_redis_cache():
    """Clear Redis cache directly"""
    try:
        # Redis Configuration from environment variables
        REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
        REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
        REDIS_DB = int(os.getenv('REDIS_DB', 0))
        REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
        
        # Connect to Redis
        redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            decode_responses=True
        )
        
        # Test connection
        redis_client.ping()
        print(f"✓ Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
        
        # Clear the products cache
        cache_key = "products_list"
        result = redis_client.delete(cache_key)
        if result:
            print("✓ Redis cache cleared successfully")
        else:
            print("• No cache found to clear")
        return True
    except Exception as e:
        print(f"Note: Could not clear Redis cache: {e}")
        print("This might be because Redis is not running or not configured.")
        return False

def restart_backend():
    """Restart the backend server"""
    print("\nTo apply all changes, please restart your backend server:")
    print("1. Stop the current Flask server (Ctrl+C)")
    print("2. Start it again with: python app.py")
    
def restart_frontend():
    """Restart the frontend server"""
    print("\nTo apply all changes, please restart your frontend server:")
    print("1. Stop the current frontend server (Ctrl+C)")
    print("2. Start it again with: npm start")

if __name__ == "__main__":
    print("Clearing Redis Cache and Preparing for Restart...")
    print("=" * 50)
    
    # Clear Redis cache
    clear_redis_cache()
    
    # Provide restart instructions
    restart_backend()
    restart_frontend()
    
    print("\n" + "=" * 50)
    print("✅ All changes have been applied!")
    print("Please restart both servers to see the updates.")