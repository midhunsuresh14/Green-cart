#!/usr/bin/env python3
"""
Initialize stock data for existing products in the GreenCart database.
This script adds stock information to products that don't have it.
"""

from pymongo import MongoClient
import random

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "greencart"

def init_stock_data():
    """Initialize stock data for all products"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        products_collection = db.products
        
        # Get all products
        products = list(products_collection.find({}))
        print(f"Found {len(products)} products")
        
        updated_count = 0
        for product in products:
            # Check if product already has stock field
            if 'stock' not in product:
                # Generate random stock between 5 and 50
                stock_amount = random.randint(5, 50)
                
                # Update product with stock
                products_collection.update_one(
                    {'_id': product['_id']},
                    {'$set': {'stock': stock_amount}}
                )
                
                print(f"Updated {product.get('name', 'Unknown')} with stock: {stock_amount}")
                updated_count += 1
            else:
                print(f"Product {product.get('name', 'Unknown')} already has stock: {product['stock']}")
        
        print(f"\nStock initialization complete!")
        print(f"Updated {updated_count} products with stock data")
        
        # Show summary
        total_products = products_collection.count_documents({})
        products_with_stock = products_collection.count_documents({'stock': {'$exists': True}})
        
        print(f"\nSummary:")
        print(f"Total products: {total_products}")
        print(f"Products with stock: {products_with_stock}")
        
        client.close()
        
    except Exception as e:
        print(f"Error initializing stock data: {e}")

if __name__ == "__main__":
    init_stock_data()
