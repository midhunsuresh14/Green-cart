from app import products_collection

print("Products in database:")
print("=" * 50)

for p in products_collection.find({}):
    name = p.get("name", "Unknown")
    category = p.get("category", "N/A")
    subcategory = p.get("subcategory", "N/A")
    image = p.get("imageUrl") or p.get("image") or "No Image"
    print(f"{name:<30} | Category: {category:<20} | Subcategory: {subcategory:<20} | Image: {image}")