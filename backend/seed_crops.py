import os
import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = "greencart"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
crops_collection = db.crop_suitability

crops_data = [
    {
        "name": "Tomato",
        "type": "Vegetable",
        "suitable_temp": {"min": 18, "max": 32},
        "suitable_humidity": {"min": 60, "max": 80},
        "suitable_season": ["Summer", "Spring"],
        "rainfall_need": "Moderate",
        "sunlight": "Full Sun",
        "care_tips": ["Water at the base", "Provide support with stakes", "Prune regularly"],
        "risk_warnings": ["Blight in humid weather", "Frost sensitive"],
        "description": "A versatile vegetable that loves warm weather and plenty of sun."
    },
    {
        "name": "Spinach",
        "type": "Vegetable",
        "suitable_temp": {"min": 5, "max": 24},
        "suitable_humidity": {"min": 50, "max": 70},
        "suitable_season": ["Winter", "Monsoon"],
        "rainfall_need": "Moderate",
        "sunlight": "Partial Shade",
        "care_tips": ["Rich, well-drained soil", "Keep soil consistently moist"],
        "risk_warnings": ["Bolts in high heat", "Aphids during spring"],
        "description": "Nutrient-rich leafy green that flourishes in cooler climates."
    },
    {
        "name": "Basil",
        "type": "Herb",
        "suitable_temp": {"min": 20, "max": 35},
        "suitable_humidity": {"min": 40, "max": 60},
        "suitable_season": ["Summer"],
        "rainfall_need": "Moderate",
        "sunlight": "Full Sun",
        "care_tips": ["Pinch off flower buds", "Needs well-drained soil"],
        "risk_warnings": ["Cold sensitive", "Powdery mildew"],
        "description": "Fragrant herb perfect for pesto and garnishing."
    },
    {
        "name": "Lavender",
        "type": "Flower/Herb",
        "suitable_temp": {"min": 10, "max": 30},
        "suitable_humidity": {"min": 20, "max": 40},
        "suitable_season": ["Spring", "Summer"],
        "rainfall_need": "Low",
        "sunlight": "Full Sun",
        "care_tips": ["Do not overwater", "Prune after flowering"],
        "risk_warnings": ["Root rot in soggy soil", "Fungal issues in high humidity"],
        "description": "Calming aromatic plant that thrives in dry, sunny spots."
    },
    {
        "name": "Okra",
        "type": "Vegetable",
        "suitable_temp": {"min": 24, "max": 40},
        "suitable_humidity": {"min": 40, "max": 90},
        "suitable_season": ["Summer", "Monsoon"],
        "rainfall_need": "Moderate",
        "sunlight": "Full Sun",
        "care_tips": ["Soak seeds before planting", "Pick pods before they grow too large"],
        "risk_warnings": ["Susceptible to root-knot nematodes", "Whiteflies"],
        "description": "Heat-loving plant that produces nutritious green pods."
    },
    {
        "name": "Mint",
        "type": "Herb",
        "suitable_temp": {"min": 15, "max": 28},
        "suitable_humidity": {"min": 70, "max": 90},
        "suitable_season": ["Monsoon", "Spring"],
        "rainfall_need": "High",
        "sunlight": "Partial Shade",
        "care_tips": ["Spreads rapidly; grow in pots", "Keep soil damp"],
        "risk_warnings": ["Invasive if not contained", "Spider mites"],
        "description": "Refreshing herb that loves moisture and cool roots."
    },
    {
        "name": "Marigold",
        "type": "Flower",
        "suitable_temp": {"min": 15, "max": 35},
        "suitable_humidity": {"min": 30, "max": 70},
        "suitable_season": ["Summer", "Winter"],
        "rainfall_need": "Moderate",
        "sunlight": "Full Sun",
        "care_tips": ["Deadhead spent blooms", "Easy to grow from seed"],
        "risk_warnings": ["Slugs in wet weather", "Mites in dry heat"],
        "description": "Cheerful flowers that act as natural pest deterrents."
    }
]

def seed_crops():
    # Clear existing data
    crops_collection.delete_many({})
    
    # Insert new data
    result = crops_collection.insert_many(crops_data)
    print(f"Successfully seeded {len(result.inserted_ids)} crops.")

if __name__ == "__main__":
    seed_crops()
