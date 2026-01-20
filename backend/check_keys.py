
import os
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

print(f"MISTRAL_API_KEY set: {'Yes' if os.getenv('MISTRAL_API_KEY') else 'No'}")
print(f"OPENWEATHERMAP_API_KEY set: {'Yes' if os.getenv('OPENWEATHERMAP_API_KEY') else 'No'}")
