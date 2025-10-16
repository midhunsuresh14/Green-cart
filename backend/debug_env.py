import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Print all environment variables related to OpenAI
print("Environment variables:")
for key, value in os.environ.items():
    if 'OPENAI' in key:
        print(f"{key}: {value}")

# Specifically check for OPENAI_API_KEY
api_key = os.getenv('OPENAI_API_KEY')
print(f"\nOPENAI_API_KEY: {api_key}")

if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key starts with: {api_key[:10]}...")
else:
    print("OPENAI_API_KEY not found in environment")