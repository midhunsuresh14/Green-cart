#!/usr/bin/env python3
"""
Script to clear Redis cache directly
"""

import redis
import os
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
        print(f"✗ Error clearing Redis cache: {e}")
        return False

if __name__ == "__main__":
    print("Clearing Redis Cache...")
    print("=" * 25)
    clear_redis_cache()