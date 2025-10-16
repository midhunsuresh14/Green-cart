#!/usr/bin/env python3
"""
Script to clear Redis cache
"""

import sys
import os

# Add the parent directory to the path so we can import app config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def clear_redis_cache():
    """Clear Redis cache if it exists"""
    try:
        from app import redis_client
        if redis_client:
            cache_key = "products_list"
            result = redis_client.delete(cache_key)
            if result:
                print("✓ Redis cache cleared successfully")
            else:
                print("• No cache found to clear")
            return True
    except ImportError:
        print("• Redis not configured in the application")
    except Exception as e:
        print(f"✗ Error clearing Redis cache: {e}")
    return False

if __name__ == "__main__":
    print("Clearing Redis Cache...")
    print("=" * 25)
    clear_redis_cache()