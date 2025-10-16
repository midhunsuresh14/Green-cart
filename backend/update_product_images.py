#!/usr/bin/env python3
"""
Script to update product images with unique URLs
This script will:
1. Check existing products in the database
2. Assign unique image URLs to each product
3. Update the database with the new image URLs
"""

import os
import sys
from pymongo import MongoClient
from datetime import datetime

# Add the parent directory to the path so we can import app config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import configuration from app.py
try:
    from app import MONGO_URI, DB_NAME
except ImportError:
    # Fallback if we can't import from app.py
    MONGO_URI = "mongodb://localhost:27017/"
    DB_NAME = "greencart"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
products_collection = db.products

# Define unique image URLs for each product
PRODUCT_IMAGE_MAP = {
    "Reusable Water Bottle": "/uploads/20250915083905742088.webp",
    "Organic Cotton Tote": "/uploads/20250915111729742270.webp",
    "Bamboo Toothbrush": "/uploads/istockphoto-1263328016-612x612.jpg",
    "Compostable Plates (50ct)": "/uploads/20251008182741485884.jpeg",
    "Solar Garden Lights": "/uploads/20250918171009190631.jpg",
    "Snake Plant": "/uploads/20250918164353826388.jpg",
    "Peace Lily": "/uploads/20250918164539716225.jpg",
    "Aloe Vera": "/uploads/20250918164742265732.jpg",
    "Lavender Seeds": "/uploads/20250918164852756162.jpg",
    "Ceramic Planter": "/uploads/20250918165107091330.jpg",
    "Gardening Gloves": "/uploads/20250918165418219540.jpg",
    "Organic Fertilizer": "/uploads/20250918165611801624.jpg",
    # Add more products as needed
}

def clear_redis_cache():
    """Clear Redis cache if it exists"""
    try:
        from app import redis_client
        if redis_client:
            cache_key = "products_list"
            redis_client.delete(cache_key)
            print("✓ Redis cache cleared")
            return True
    except Exception as e:
        print(f"Note: Could not clear Redis cache: {e}")
    return False

def update_product_images():
    """Update product images with unique URLs"""
    print("Updating product images...")
    
    updated_count = 0
    
    # Get all products
    products = list(products_collection.find({}))
    
    for product in products:
        product_name = product.get('name')
        if not product_name:
            continue
            
        # Check if we have a specific image for this product
        if product_name in PRODUCT_IMAGE_MAP:
            new_image_url = PRODUCT_IMAGE_MAP[product_name]
            
            # Update only if the image is different
            current_image = product.get('imageUrl') or product.get('image')
            if current_image != new_image_url:
                # Update the product with the new image URL
                products_collection.update_one(
                    {'_id': product['_id']},
                    {
                        '$set': {
                            'imageUrl': new_image_url,
                            'image': new_image_url,
                            'updated_at': datetime.utcnow()
                        }
                    }
                )
                print(f"✓ Updated image for '{product_name}': {new_image_url}")
                updated_count += 1
        else:
            # For products not in our map, use a default image if they don't have one
            current_image = product.get('imageUrl') or product.get('image')
            if not current_image:
                # Use the first available image as fallback
                fallback_image = next(iter(PRODUCT_IMAGE_MAP.values()))
                products_collection.update_one(
                    {'_id': product['_id']},
                    {
                        '$set': {
                            'imageUrl': fallback_image,
                            'image': fallback_image,
                            'updated_at': datetime.utcnow()
                        }
                    }
                )
                print(f"✓ Updated image for '{product_name}' (fallback): {fallback_image}")
                updated_count += 1
    
    print(f"\nUpdated {updated_count} products with unique images.")
    print("Clearing Redis cache to reflect changes...")
    clear_redis_cache()

def list_all_products():
    """List all products with their current images"""
    print("\nCurrent product images:")
    print("-" * 50)
    
    products = products_collection.find({})
    for product in products:
        name = product.get('name', 'Unknown')
        image = product.get('imageUrl') or product.get('image') or 'None'
        print(f"{name:<30} | {image}")

if __name__ == "__main__":
    print("Product Image Update Script")
    print("=" * 30)
    
    # Show current state
    list_all_products()
    
    # Ask for confirmation
    print("\n" + "=" * 30)
    response = input("Do you want to update product images with unique URLs? (y/N): ")
    
    if response.lower() in ['y', 'yes']:
        update_product_images()
        print("\n" + "=" * 30)
        print("Update complete!")
        list_all_products()
    else:
        print("Operation cancelled.")