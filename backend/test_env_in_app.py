import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Print the current working directory
print("Current working directory:", os.getcwd())

# Print all files in the current directory
print("Files in current directory:", os.listdir('.'))

# Check if .env file exists
if os.path.exists('.env'):
    print(".env file exists")
else:
    print(".env file does not exist")

# Try to read the .env file directly
try:
    with open('.env', 'r') as f:
        content = f.read()
        print("First 200 characters of .env file:")
        print(content[:200])
except Exception as e:
    print(f"Error reading .env file: {e}")

# Print the OPENAI_API_KEY environment variable
api_key = os.getenv('OPENAI_API_KEY')
print(f"OPENAI_API_KEY environment variable: {api_key}")

if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key starts with: {api_key[:20]}...")
else:
    print("OPENAI_API_KEY not found in environment")