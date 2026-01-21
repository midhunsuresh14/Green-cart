from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = "greencart"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db.users

def list_staff():
    print("Listing staff users...")
    staff = users_collection.find({'role': {'$in': ['store_manager', 'delivery_boy', 'admin']}})
    for user in staff:
        print(f"ID: {user['_id']}, Name: {user.get('name')}, Email: {user.get('email')}, Role: {user.get('role')}, Has Password: {'password' in user}")

if __name__ == "__main__":
    list_staff()
