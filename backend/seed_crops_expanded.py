from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = "greencart"

def seed_expanded_crops():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    crops_collection = db.crop_suitability

    crops = [
        # --- VEGETABLES ---
        {
            "name": "Tomato",
            "type": "Vegetable",
            "suitable_temp": {"min": 18, "max": 32},
            "suitable_humidity": {"min": 60, "max": 85},
            "suitable_season": ["Summer", "Spring"],
            "sunlight": "Full Sun",
            "rainfall": "Moderate",
            "care_tips": ["Water at base", "Support with stakes", "Prune suckers"],
            "risk_warnings": ["Blight in high humidity", "Frost can kill vines"],
            "description": "Essential garden staple that loves warm weather and consistent moisture.",
            "image_url": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=300&q=80",
            "growth_period": "60-80 days"
        },
        {
            "name": "Carrot",
            "type": "Vegetable",
            "suitable_temp": {"min": 10, "max": 24},
            "suitable_humidity": {"min": 40, "max": 70},
            "suitable_season": ["Winter", "Spring"],
            "sunlight": "Partial to Full Sun",
            "care_tips": ["Loose sandy soil", "Thin seedlings", "Keep soil moist"],
            "description": "Crispy root vegetable that thrives in cooler climates and loose soil.",
            "growth_period": "70-80 days"
        },
        {
            "name": "Okra (Bhindi)",
            "type": "Vegetable",
            "suitable_temp": {"min": 24, "max": 40},
            "suitable_humidity": {"min": 50, "max": 90},
            "suitable_season": ["Summer", "Monsoon"],
            "sunlight": "Full Sun",
            "care_tips": ["Frequent harvesting", "Heat tolerant", "Consistent watering"],
            "description": "High-heat lover common in tropical climates. Grows quickly.",
            "growth_period": "50-65 days"
        },
        {
            "name": "Capsicum (Bell Pepper)",
            "type": "Vegetable",
            "suitable_temp": {"min": 15, "max": 30},
            "suitable_humidity": {"min": 60, "max": 80},
            "suitable_season": ["Spring", "Summer"],
            "sunlight": "Full Sun",
            "care_tips": ["Mulch to retain moisture", "Requires Calcium", "Avoid overwatering"],
            "description": "Vibrant and crunchy, these plants love stable warm temperatures.",
            "growth_period": "60-90 days"
        },
        {
            "name": "Potato",
            "type": "Vegetable",
            "suitable_temp": {"min": 15, "max": 25},
            "suitable_humidity": {"min": 50, "max": 75},
            "suitable_season": ["Winter", "Spring"],
            "sunlight": "Full Sun",
            "care_tips": ["Hilling soil", "Monitor for beetles", "Cool soil is best"],
            "description": "Reliable tuber that prefers slightly acidic soil and cool nights.",
            "growth_period": "70-120 days"
        },
        {
            "name": "Cabbage",
            "type": "Vegetable",
            "suitable_temp": {"min": 7, "max": 20},
            "suitable_humidity": {"min": 60, "max": 90},
            "suitable_season": ["Winter"],
            "sunlight": "Full Sun",
            "care_tips": ["Heavy feeder", "Deep watering", "Protect from worms"],
            "description": "Cold-hardy crop that forms tight heads in chilly weather.",
            "growth_period": "80-100 days"
        },
        {
            "name": "Eggplant (Brinjal)",
            "type": "Vegetable",
            "suitable_temp": {"min": 20, "max": 35},
            "suitable_humidity": {"min": 60, "max": 85},
            "suitable_season": ["Summer", "Monsoon"],
            "sunlight": "Full Sun",
            "care_tips": ["Likes warm soul", "Space plants well", "Fertilize regularly"],
            "description": "A tropical perennial often grown as an annual. Loves humidity.",
            "growth_period": "100-120 days"
        },
        {
            "name": "Cucumber",
            "type": "Vegetable",
            "suitable_temp": {"min": 20, "max": 33},
            "suitable_humidity": {"min": 60, "max": 90},
            "suitable_season": ["Summer", "Spring"],
            "sunlight": "Full Sun",
            "care_tips": ["Vines need space", "Keep consistently wet", "Pick often"],
            "description": "Fast-growing vine that produces refreshing fruits in the heat.",
            "growth_period": "50-70 days"
        },

        # --- HERBS ---
        {
            "name": "Basil",
            "type": "Herb",
            "suitable_temp": {"min": 15, "max": 35},
            "suitable_humidity": {"min": 40, "max": 70},
            "suitable_season": ["Summer", "Spring"],
            "sunlight": "Full Sun",
            "care_tips": ["Pinch flowers to prolong life", "Water at base", "Avoid cold"],
            "description": "Aromatic culinary herb that loves warmth and plenty of light.",
            "growth_period": "30-60 days"
        },
        {
            "name": "Mint (Pudina)",
            "type": "Herb",
            "suitable_temp": {"min": 10, "max": 30},
            "suitable_humidity": {"min": 60, "max": 90},
            "suitable_season": ["Monsoon", "Spring", "Summer"],
            "sunlight": "Partial Shade",
            "care_tips": ["Invasive (grow in pots)", "Loves damp soil", "Harvest daily"],
            "description": "Incredibly hardy herb that spreads quickly in moist areas.",
            "growth_period": "Perennial (Harvest in 60 days)"
        },
        {
            "name": "Coriander (Dhaniya)",
            "type": "Herb",
            "suitable_temp": {"min": 10, "max": 25},
            "suitable_humidity": {"min": 30, "max": 60},
            "suitable_season": ["Winter", "Spring"],
            "sunlight": "Partial Sun",
            "care_tips": ["Bolts in high heat", "Don't overwater", "Sow every 2 weeks"],
            "description": "Quick-growing herb essential for many cuisines. Prefers cool weather.",
            "growth_period": "40-45 days"
        },
        {
            "name": "Rosemary",
            "type": "Herb",
            "suitable_temp": {"min": 5, "max": 30},
            "suitable_humidity": {"min": 20, "max": 50},
            "suitable_season": ["Winter", "Spring", "Summer"],
            "sunlight": "Full Sun",
            "care_tips": ["Well-draining soil", "Drought tolerant", "Don't overwater"],
            "description": "Woody perennial that thrives in Mediterranean-style dry climates.",
            "growth_period": "Perennial (Harvest year-round)"
        },

        # --- FLOWERS ---
        {
            "name": "Marigold",
            "type": "Flower",
            "suitable_temp": {"min": 15, "max": 35},
            "suitable_humidity": {"min": 50, "max": 80},
            "suitable_season": ["Winter", "Summer", "Monsoon"],
            "sunlight": "Full Sun",
            "care_tips": ["Deadhead flowers", "Repels pests", "Drought tolerant"],
            "description": "Cheerful and hardy flowers used for decoration and pest control.",
            "growth_period": "50-60 days"
        },
        {
            "name": "Rose",
            "type": "Flower",
            "suitable_temp": {"min": 15, "max": 28},
            "suitable_humidity": {"min": 50, "max": 70},
            "suitable_season": ["Winter", "Spring"],
            "sunlight": "Full Sun",
            "care_tips": ["Regular pruning", "Deep watering", "Check for pests"],
            "description": "The queen of flowers. Prefers moderate temperatures and low humidity.",
            "growth_period": "Perennial"
        },
        {
            "name": "Petunia",
            "type": "Flower",
            "suitable_temp": {"min": 10, "max": 25},
            "suitable_humidity": {"min": 40, "max": 60},
            "suitable_season": ["Winter", "Spring"],
            "sunlight": "Full Sun",
            "care_tips": ["Fertilize often", "Deadhead spent blooms", "Keep moist"],
            "description": "Popular annual flower that provides a massive burst of color.",
            "growth_period": "70-80 days"
        },
        {
            "name": "Sunflowers",
            "type": "Flower",
            "suitable_temp": {"min": 20, "max": 38},
            "suitable_humidity": {"min": 40, "max": 80},
            "suitable_season": ["Summer"],
            "sunlight": "Full Sun",
            "care_tips": ["Support tall varieties", "Water deeply", "Birds love seeds"],
            "description": "Fast-growing giant that loves the hottest days of summer.",
            "growth_period": "80-120 days"
        },

        # --- FRUITS ---
        {
            "name": "Strawberry",
            "type": "Fruit",
            "suitable_temp": {"min": 10, "max": 25},
            "suitable_humidity": {"min": 50, "max": 75},
            "suitable_season": ["Winter", "Spring"],
            "sunlight": "Full Sun",
            "care_tips": ["Mulch with straw", "Keep berries off soil", "Well-drained soil"],
            "description": "Delicious low-growing fruit that loves cool mornings and sunny days.",
            "growth_period": "60-90 days"
        },
        {
            "name": "Papaya",
            "type": "Fruit",
            "suitable_temp": {"min": 20, "max": 38},
            "suitable_humidity": {"min": 60, "max": 90},
            "suitable_season": ["Summer", "Monsoon"],
            "sunlight": "Full Sun",
            "care_tips": ["Needs excellent drainage", "Frost sensitive", "Heavy feeder"],
            "description": "Fast-growing tropical tree that produces sweet fruit year-round.",
            "growth_period": "9-11 months"
        },
        {
            "name": "Watermelon",
            "type": "Fruit",
            "suitable_temp": {"min": 24, "max": 38},
            "suitable_humidity": {"min": 50, "max": 80},
            "suitable_season": ["Summer"],
            "sunlight": "Full Sun",
            "care_tips": ["Needs lots of space", "Keep soil moist", "Stop watering near harvest"],
            "description": "The ultimate summer fruit. Needs high heat and a long growing season.",
            "growth_period": "80-100 days"
        },
        {
            "name": "Grapes",
            "type": "Fruit",
            "suitable_temp": {"min": 15, "max": 35},
            "suitable_humidity": {"min": 40, "max": 60},
            "suitable_season": ["Spring", "Summer"],
            "sunlight": "Full Sun",
            "care_tips": ["Requires trellis", "Prune in winter", "Avoid humidity during ripening"],
            "description": "Vineyard crop that loves dry heat and well-draining soil.",
            "growth_period": "Perennial (3 years to fruit)"
        }
    ]

    # Clear existing and insert new
    crops_collection.delete_many({})
    result = crops_collection.insert_many(crops)
    print(f"Successfully seeded {len(result.inserted_ids)} crops into MongoDB.")

if __name__ == "__main__":
    seed_expanded_crops()
