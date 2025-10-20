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

def check_user_details():
    """Check detailed user information including all fields"""
    admin_email = "admin@greencart.local"
    
    # Find the admin user with all fields
    admin_user = users_collection.find_one({"email": admin_email})
    if not admin_user:
        print(f"✗ Admin user {admin_email} not found")
        return
    
    print("Admin User Details:")
    print("=" * 40)
    for key, value in admin_user.items():
        print(f"{key}: {value}")
    print("=" * 40)

if __name__ == "__main__":
    print("Checking detailed user information...")
    check_user_details()
    print("Done.")