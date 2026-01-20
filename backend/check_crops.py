
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = "greencart"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
crops = db.crop_suitability

print(f"Count: {crops.count_documents({})}")
print("Example:", crops.find_one())
