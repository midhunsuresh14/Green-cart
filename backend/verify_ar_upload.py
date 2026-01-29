from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

try:
    client = MongoClient(os.getenv('MONGO_URI') or 'mongodb://localhost:27017/greencart')
    db = client['greencart']
    products = db.products
    
    # Find all Areca Palm products
    print("--- Searching for 'Areca Palm' ---")
    cursor = products.find({"name": {"$regex": "Areca Palm", "$options": "i"}})
    for p in cursor:
        print(f"ID: {p['_id']} | Name: {p['name']} | AR URL: {p.get('arModelUrl', 'NOT SET')}")

    # Check for ANY product with arModelUrl set
    print("\n--- All products with arModelUrl ---")
    cursor = products.find({"arModelUrl": {"$exists": True, "$ne": ""}})
    count = 0
    for p in cursor:
        print(f"ID: {p['_id']} | Name: {p['name']} | AR URL: {p['arModelUrl']}")
        count += 1
    if count == 0:
        print("No products found with arModelUrl set.")
except Exception as e:
    print(f"Error: {e}")
