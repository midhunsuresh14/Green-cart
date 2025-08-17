#!/usr/bin/env python3
"""
Simple script to show MongoDB connection and user information
"""

from pymongo import MongoClient
import json
from datetime import datetime

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "greencart"

def main():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        client.admin.command('ping')
        db = client[DB_NAME]
        
        print("🌱 GreenCart MongoDB Connection Info")
        print("="*50)
        
        # Connection info
        server_info = client.server_info()
        db_stats = db.command("dbstats")
        
        print(f"🔗 Connection URI: {MONGO_URI}")
        print(f"🗄️  Database Name: {DB_NAME}")
        print(f"✅ Connection Status: Connected")
        print(f"🖥️  MongoDB Version: {server_info['version']}")
        print(f"📦 Database Size: {db_stats.get('dataSize', 0) / 1024:.2f} KB")
        print(f"📁 Collections: {', '.join(db.list_collection_names())}")
        
        # User information
        users_collection = db.users
        user_count = users_collection.count_documents({})
        print(f"👥 Total Users: {user_count}")
        
        if user_count > 0:
            print("\n📋 User List:")
            print("-" * 80)
            users = list(users_collection.find({}, {'password': 0}))
            
            for i, user in enumerate(users, 1):
                print(f"{i}. {user.get('name', 'N/A')} ({user.get('email', 'N/A')})")
                print(f"   📱 Phone: {user.get('phone', 'N/A')}")
                print(f"   🏷️  Role: {user.get('role', 'user')}")
                print(f"   📅 Created: {user.get('created_at', 'N/A')}")
                print(f"   🆔 ID: {user['_id']}")
                if i < len(users):
                    print()
        
        print("="*50)
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()