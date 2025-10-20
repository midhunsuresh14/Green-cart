from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    # MongoDB Configuration
    MONGO_URI = "mongodb://localhost:27017/"
    DB_NAME = "greencart"
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    users_collection = db.users

    print("Checking users in database...")
    
    # Check total users count
    total_users = users_collection.count_documents({})
    print(f"\nTotal users: {total_users}")
    
    # List all users
    users = list(users_collection.find())
    print("\nAll users:")
    for user in users:
        print(f"  - ID: {user.get('_id')}")
        print(f"    Email: {user.get('email', 'No email')}")
        print(f"    Name: {user.get('name', 'No name')}")
        print(f"    Role: {user.get('role', 'No role')}")
        print(f"    Active: {user.get('active', 'Unknown')}")
        print()

    print("\nDone.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")