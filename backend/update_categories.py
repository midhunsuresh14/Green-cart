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

print("Updating database with complete category structure...")

# Add some new products for missing categories
new_products = [
    # Soil & Fertilizers
    {
        "name": "Premium Potting Mix 5kg",
        "category": "Soil & Fertilizers",
        "subcategory": "Potting Mix",
        "price": 199,
        "stock": 25,
        "description": "Nutrient-rich potting mix for healthy plant growth.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    },
    {
        "name": "Organic Vermicompost 5kg",
        "category": "Soil & Fertilizers",
        "subcategory": "Compost/Manure",
        "price": 149,
        "stock": 20,
        "description": "100% organic vermicompost for garden and potted plants.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    },
    
    # Gardening Tools
    {
        "name": "Stainless Steel Hand Trowel",
        "category": "Gardening Tools",
        "subcategory": "Hand Tools",
        "price": 89,
        "stock": 30,
        "description": "Durable hand trowel for planting and transplanting.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    },
    {
        "name": "Watering Can 5L",
        "category": "Gardening Tools",
        "subcategory": "Watering Tools",
        "price": 199,
        "stock": 15,
        "description": "Ergonomic watering can with rose attachment.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    },
    
    # Herbal & Eco Products
    {
        "name": "Aloe Vera Gel 200ml",
        "category": "Herbal & Eco Products",
        "subcategory": "Herbal Remedies",
        "price": 129,
        "stock": 25,
        "description": "Pure aloe vera gel for skin care and healing.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    },
    
    # Crops & Seeds - additional subcategories
    {
        "name": "Organic Fenugreek Seeds",
        "category": "Crops & Seeds",
        "subcategory": "Spices/Herbs",
        "price": 59,
        "stock": 40,
        "description": "Organic fenugreek seeds for kitchen garden.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    },
    
    # Plants - additional subcategories
    {
        "name": "Lavender Plant",
        "category": "Plants",
        "subcategory": "Medicinal/Herbal",
        "price": 299,
        "stock": 15,
        "description": "Fragrant lavender plant with medicinal properties.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    },
    {
        "name": "Marigold (Tagetes)",
        "category": "Plants",
        "subcategory": "Flowering",
        "price": 149,
        "stock": 20,
        "description": "Bright flowering marigold plant for garden borders.",
        "imageUrl": "",
        "rating": 4,
        "reviews": 10
    }
]

# Insert new products
for product in new_products:
    # Check if product already exists
    existing = products_collection.find_one({
        "name": product["name"], 
        "category": product["category"]
    })
    if not existing:
        products_collection.insert_one(product)
        print(f"Added new product: {product['name']}")

print("Database update completed!")