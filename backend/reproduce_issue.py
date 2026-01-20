
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = "greencart"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
crops_collection = db.crop_suitability

# Test Case 1: Ideal conditions for Tomato
temp = 25
humidity = 70
query = {
    "suitable_temp.min": {"$lte": temp},
    "suitable_temp.max": {"$gte": temp},
    "suitable_humidity.min": {"$lte": humidity},
    "suitable_humidity.max": {"$gte": humidity}
}
print(f"Testing {temp}C, {humidity}% humidity")
results = list(crops_collection.find(query))
print(f"Found {len(results)} crops")
for c in results:
    print(f" - {c['name']}")

# Test Case 2: Hot conditions (might fail)
temp = 35
humidity = 50
query = {
    "suitable_temp.min": {"$lte": temp},
    "suitable_temp.max": {"$gte": temp},
    "suitable_humidity.min": {"$lte": humidity},
    "suitable_humidity.max": {"$gte": humidity}
}
print(f"\nTesting {temp}C, {humidity}% humidity")
results = list(crops_collection.find(query))
print(f"Found {len(results)} crops")
for c in results:
    print(f" - {c['name']}")
