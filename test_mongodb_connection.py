#!/usr/bin/env python3
"""
Test MongoDB Connection Script
This script tests the MongoDB connection using the configuration from your .env file.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the path so we can import from it
backend_path = Path(__file__).parent / "backend"
sys.path.append(str(backend_path))

try:
    # Try to load environment variables
    from dotenv import load_dotenv
    load_dotenv(backend_path / ".env")
except ImportError:
    print("Warning: python-dotenv not installed. Using environment variables from system.")

try:
    from pymongo import MongoClient
    import pymongo
    print(f"PyMongo version: {pymongo.version_tuple}")
except ImportError:
    print("Error: PyMongo not installed. Please install it with: pip install pymongo")
    sys.exit(1)

def test_mongodb_connection():
    """Test MongoDB connection using environment variables"""
    
    # Get MongoDB configuration from environment
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    db_name = os.getenv('DB_NAME', 'greencart')
    
    print(f"Testing MongoDB connection...")
    print(f"Connection URI: {mongo_uri}")
    print(f"Database name: {db_name}")
    print("-" * 50)
    
    try:
        # Create MongoDB client
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000
        )
        
        # Test the connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # List databases
        print("\nAvailable databases:")
        for db_name in client.list_database_names():
            print(f"  - {db_name}")
        
        # Test accessing the greencart database
        db = client[os.getenv('DB_NAME', 'greencart')]
        print(f"\n✅ Successfully accessed '{db.name}' database")
        
        # List collections in the database
        print("\nCollections in database:")
        collections = db.list_collection_names()
        if collections:
            for collection in collections:
                print(f"  - {collection}")
        else:
            print("  - No collections found")
            
        # Close the connection
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\nTroubleshooting steps:")
        print("1. Check if MongoDB is running (for local installation)")
        print("2. Verify your MONGO_URI in the .env file")
        print("3. If using MongoDB Atlas, ensure your IP is whitelisted")
        print("4. Check your username and password")
        return False

if __name__ == "__main__":
    print("MongoDB Connection Test")
    print("=" * 50)
    success = test_mongodb_connection()
    sys.exit(0 if success else 1)