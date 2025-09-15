# Seed script for GreenCart
# Creates an admin user, a few products, and one sample order

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import datetime

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "greencart"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users = db.users
products = db.products
orders = db.orders


def ensure_admin_user():
    admin_email = "admin@greencart.local"
    admin_password_plain = "Admin123!"  # change after first login
    now = datetime.datetime.utcnow()

    # Use upsert with $setOnInsert to avoid overwriting existing admin
    res = users.update_one(
        {"email": admin_email},
        {
            "$setOnInsert": {
                "email": admin_email,
                "password": generate_password_hash(admin_password_plain),
                "name": "Admin",
                "phone": "",
                "role": "admin",
                "active": True,
                "created_at": now,
                "last_login": None,
            }
        },
        upsert=True,
    )

    if res.upserted_id:
        print(f"✓ Created admin user: {admin_email} (default password: {admin_password_plain})")
        return str(res.upserted_id)

    existing = users.find_one({"email": admin_email}, {"_id": 1})
    print(f"• Admin user already exists: {admin_email}")
    return str(existing["_id"]) if existing else None


def seed_products():
    sample_products = [
        {"name": "Reusable Water Bottle", "category": "Accessories", "price": 14.99, "stock": 120},
        {"name": "Organic Cotton Tote", "category": "Bags", "price": 9.5, "stock": 200},
        {"name": "Bamboo Toothbrush", "category": "Personal Care", "price": 3.99, "stock": 500},
        {"name": "Compostable Plates (50ct)", "category": "Kitchen", "price": 12.49, "stock": 80},
        {"name": "Solar Garden Lights", "category": "Outdoor", "price": 24.99, "stock": 45},
    ]

    created = 0
    for p in sample_products:
        existing = products.find_one({"name": p["name"]}, {"_id": 1})
        if not existing:
            doc = {
                **p,
                "created_at": datetime.datetime.utcnow(),
            }
            products.insert_one(doc)
            created += 1
    print(f"✓ Products seeded (added {created}, total now {products.count_documents({})})")


def seed_order():
    # Create a sample order only if there are no orders yet
    if orders.count_documents({}) > 0:
        print("• Orders already exist; skipping sample order")
        return

    # Use up to 2 products to build an order total
    sample_items = list(products.find({}, {"name": 1, "price": 1}).limit(2))
    if not sample_items:
        print("• No products available to create a sample order; skipping")
        return

    total = sum(float(i.get("price", 0)) for i in sample_items)
    now = datetime.datetime.utcnow()

    order_doc = {
        "customerName": "John Doe",
        "total": total,
        "status": "pending",
        "created_at": now,
        # Optional: store simple items snapshot
        "items": [
            {"productName": i.get("name"), "price": float(i.get("price", 0)), "qty": 1}
            for i in sample_items
        ],
    }

    res = orders.insert_one(order_doc)
    print(f"✓ Created sample order: {res.inserted_id}")


def main():
    print("Seeding GreenCart database...")
    admin_id = ensure_admin_user()
    seed_products()
    seed_order()
    print("Done.")


if __name__ == "__main__":
    main()