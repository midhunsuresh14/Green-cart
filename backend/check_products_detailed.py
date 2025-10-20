from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "greencart"
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]
products_collection = db.products

print("Checking database contents...")

# Check products
print("\nProducts count:", products_collection.count_documents({}))
products = list(products_collection.find())
print("All products:")
for product in products:
    print(f"  - ID: {product.get('_id')}")
    print(f"    Name: {product.get('name', 'No name')}")
    print(f"    Image: {product.get('image', 'No image')}")
    print(f"    ImageUrl: {product.get('imageUrl', 'No imageUrl')}")
    print(f"    Description: {product.get('description', 'No description')}")
    print(f"    Category: {product.get('category', 'No category')}")
    print(f"    Price: {product.get('price', 'No price')}")
    print(f"    Stock: {product.get('stock', 0)}")
    print()

print("\nDone.")