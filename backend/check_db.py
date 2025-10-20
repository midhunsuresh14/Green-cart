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
    products_collection = db.products
    remedies_collection = db.remedies

    print("Checking database contents...")

    # Check products
    print("\nProducts count:", products_collection.count_documents({}))
    products = list(products_collection.find().limit(5))
    print("Sample products:")
    for product in products:
        print(f"  - {product.get('name', 'No name')} (ID: {product.get('_id')})")

    # Check remedies
    print("\nRemedies count:", remedies_collection.count_documents({}))
    remedies = list(remedies_collection.find().limit(5))
    print("Sample remedies:")
    for remedy in remedies:
        print(f"  - {remedy.get('name', 'No name')} (ID: {remedy.get('_id')})")

    print("\nDone.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")