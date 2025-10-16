import pymongo
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI', "mongodb://localhost:27017/")
DB_NAME = os.getenv('DB_NAME', "greencart")

# Connect to MongoDB
client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]
products_collection = db.products
from app import categories_collection

print("Categories in database:")
print("=" * 30)

for cat in categories_collection.find({}):
    name = cat.get("name", "Unknown")
    subcategories = cat.get("subcategories", [])
    sub_names = [sub.get("name", "Unknown") for sub in subcategories]
    print(f"{name}: {sub_names}")

print("Checking all categories and subcategories in database...")
print("=" * 60)

# Get unique categories and subcategories
categories = products_collection.distinct('category')
print(f"Total categories: {len(categories)}")
print(f"Categories: {categories}")

print("\nDetailed category and subcategory breakdown:")
print("-" * 40)

all_subcategories = set()
for category in categories:
    subcategories = products_collection.distinct('subcategory', {'category': category})
    subcategories = [sub for sub in subcategories if sub]  # Remove empty strings
    all_subcategories.update(subcategories)
    print(f"{category}:")
    if subcategories:
        for subcategory in subcategories:
            count = products_collection.count_documents({'category': category, 'subcategory': subcategory})
            print(f"  - {subcategory} ({count} products)")
    else:
        count = products_collection.count_documents({'category': category, 'subcategory': ''})
        print(f"  - (no subcategory) ({count} products)")

print(f"\nAll unique subcategories: {all_subcategories}")

print("\nSample products with their categories and subcategories:")
print("-" * 50)
sample_products = list(products_collection.find({}, {'name': 1, 'category': 1, 'subcategory': 1}).limit(20))
for product in sample_products:
    print(f"{product.get('name', 'N/A'):<30} - {product.get('category', 'N/A'):<20} > {product.get('subcategory', 'N/A')}")
