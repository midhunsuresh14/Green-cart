from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

try:
    client = MongoClient(os.getenv('MONGO_URI') or 'mongodb://localhost:27017/greencart')
    db = client['greencart']
    products = db.products
    
    # Find all snake plants
    print("--- Searching for 'Snake Plant' ---")
    cursor = products.find({"name": {"$regex": "Snake Plant", "$options": "i"}})
    for p in cursor:
        print(f"ID: {p['_id']} | Name: {p['name']} | AR URL: {p.get('arModelUrl', 'NOT SET')}")

    # Check if ANY product has arModelUrl set
    print("\n--- Checking for ANY product with arModelUrl ---")
    any_ar = products.find_one({"arModelUrl": {"$exists": True, "$ne": ""}})
    if any_ar:
        print(f"Found product with AR: {any_ar['name']}")
        print(f"ID: {any_ar['_id']}")
        print(f"URL: {any_ar['arModelUrl']}")
    else:
        print("No products found with arModelUrl set.")
        
except Exception as e:
    print(f"Error: {e}")
