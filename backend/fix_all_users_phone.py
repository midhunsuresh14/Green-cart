from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "greencart"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db.users

def fix_all_users_phone():
    """Ensure all users have a phone field"""
    # Find all users without a phone field
    users_without_phone = list(users_collection.find({"phone": {"$exists": False}}))
    
    if not users_without_phone:
        print("✓ All users already have phone fields")
        return
    
    print(f"Found {len(users_without_phone)} users without phone fields")
    
    # Update each user to include phone field
    for user in users_without_phone:
        result = users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"phone": ""}}
        )
        
        if result.modified_count > 0:
            print(f"✓ Added phone field to user: {user['email']}")
        else:
            print(f"• No changes made to user: {user['email']}")

if __name__ == "__main__":
    print("Ensuring all users have phone fields...")
    fix_all_users_phone()
    print("Done.")