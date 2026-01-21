from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = "greencart"

def seed_crop_products():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    products_collection = db.products
    
    # Mapping crops to products
    products = [
        {
            "name": "Tomato Seeds",
            "category": "Crops",
            "price": 45,
            "stock": 100,
            "description": "High-quality organic tomato seeds. Perfect for home gardening.",
            "imageUrl": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=300&q=80",
            "rating": 4.5,
            "reviews": 12
        },
        {
            "name": "Carrot Seeds",
            "category": "Crops",
            "price": 35,
            "stock": 80,
            "description": "Sweet and crunchy carrot seeds. Easy to grow.",
            "imageUrl": "https://images.unsplash.com/photo-1445282768818-728615cc8d07?auto=format&fit=crop&w=300&q=80",
            "rating": 4.2,
            "reviews": 8
        },
        {
            "name": "Okra (Bhindi) Seeds",
            "category": "Crops",
            "price": 30,
            "stock": 150,
            "description": "Fast-growing Okra seeds for a bountiful harvest.",
            "imageUrl": "https://images.unsplash.com/photo-1550989460-5250499738d8?auto=format&fit=crop&w=300&q=80",  # Placeholder
            "rating": 4.0,
            "reviews": 5
        },
        {
            "name": "Basil Seeds",
            "category": "Crops",
            "price": 55,
            "stock": 40,
            "description": "Aromatic Italian Basil seeds. Essential for your herb garden.",
            "imageUrl": "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=300&q=80",
            "rating": 4.8,
            "reviews": 24
        },
         {
            "name": "Spinach Seeds",
            "category": "Crops",
            "price": 25,
            "stock": 200,
            "description": "Nutrient-rich spinach seeds. fast growing leafy green.",
            "imageUrl": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80",
            "rating": 4.3,
            "reviews": 15
        },
        {
            "name": "Sunflower Seeds",
            "category": "Crops",
            "price": 40,
            "stock": 60,
            "description": "Giant sunflower seeds. Bring sunshine to your garden.",
            "imageUrl": "https://images.unsplash.com/photo-1471193945509-9adadd0974ce?auto=format&fit=crop&w=300&q=80",
            "rating": 4.7,
            "reviews": 30
        }
    ]

    count = 0
    for prod in products:
        # Update if exists, insert if not (Upsert)
        result = products_collection.update_one(
            {"name": prod["name"]},
            {"$set": prod},
            upsert=True
        )
        
        if result.upserted_id:
            print(f"Added {prod['name']}")
            count += 1
        elif result.modified_count > 0:
             print(f"Updated {prod['name']}")
             count += 1
        else:
            print(f"Skipped {prod['name']} (no changes)")

    print(f"Seeding complete. Added {count} new products.")

if __name__ == "__main__":
    seed_crop_products()
