from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import datetime
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

def create_admin_user():
    """Create an admin user in the database"""
    admin_email = "admin@greencart.local"
    admin_password = "Admin123!"  # Change this after first login
    admin_name = "Admin"
    
    # Check if admin user already exists
    existing_admin = users_collection.find_one({"email": admin_email})
    if existing_admin:
        print(f"• Admin user {admin_email} already exists")
        return
    
    # Hash the password
    hashed_password = generate_password_hash(admin_password)
    
    # Create admin user document
    admin_doc = {
        "name": admin_name,
        "email": admin_email,
        "password": hashed_password,
        "role": "admin",
        "active": True,
        "created_at": datetime.datetime.utcnow()
    }
    
    # Insert admin user into MongoDB
    result = users_collection.insert_one(admin_doc)
    print(f"✓ Created admin user: {admin_name} ({admin_email}) with ID: {result.inserted_id}")
    print(f"  Password: {admin_password} (Please change after first login)")
    print(f"  Role: {admin_doc['role']}")
    print(f"  Status: {'Active' if admin_doc['active'] else 'Inactive'}")

if __name__ == "__main__":
    print("Creating admin user for GreenCart...")
    create_admin_user()
    print("Done.")