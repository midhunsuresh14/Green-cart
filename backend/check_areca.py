from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

try:
    client = MongoClient(os.getenv('MONGO_URI') or 'mongodb://localhost:27017/greencart')
    db = client['greencart']
    products = db.products
    
    # Find active Areca Plant
    print("--- Searching for 'Areca Plant' ---")
    cursor = products.find({"name": {"$regex": "Areca", "$options": "i"}})
    found = False
    for p in cursor:
        found = True
        print(f"ID: {p['_id']} | Name: {p['name']}")
        print(f"AR URL: {p.get('arModelUrl', 'NOT SET')}")
        print(f"Image: {p.get('image', 'NOT SET')}")
        print("-" * 20)

    if not found:
        print("No 'Areca Plant' found.")
        
except Exception as e:
    print(f"Error: {e}")
