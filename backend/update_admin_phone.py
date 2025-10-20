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

def update_admin_phone():
    """Update the admin user to include a phone field"""
    admin_email = "admin@greencart.local"
    
    # Find the admin user
    admin_user = users_collection.find_one({"email": admin_email})
    if not admin_user:
        print(f"✗ Admin user {admin_email} not found")
        return
    
    # Check if phone field already exists
    if "phone" in admin_user:
        print(f"• Admin user already has phone field: {admin_user['phone']}")
        return
    
    # Update the admin user with phone field
    result = users_collection.update_one(
        {"email": admin_email},
        {"$set": {"phone": ""}}  # Empty string for phone
    )
    
    if result.modified_count > 0:
        print(f"✓ Added phone field to admin user: {admin_email}")
    else:
        print(f"• No changes made to admin user")

if __name__ == "__main__":
    print("Updating admin user to include phone field...")
    update_admin_phone()
    print("Done.")