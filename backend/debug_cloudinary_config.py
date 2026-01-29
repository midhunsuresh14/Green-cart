import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

def check_env(name):
    val = os.getenv(name)
    if not val:
        print(f"❌ {name} is NOT set")
        return
        
    stripped = val.strip()
    print(f"✅ {name} is set")
    print(f"   Length: {len(val)}")
    if val != stripped:
        print(f"   ⚠️ WARNING: {name} has leading/trailing whitespace!")
    print(f"   Starts with: {val[0]}... Ends with: ...{val[-1]}")

print("--- Cloudinary Diagnostics ---")
check_env('CLOUD_NAME')
check_env('CLOUD_API_KEY')
check_env('CLOUD_API_SECRET')

try:
    import cloudinary
    print(f"✅ Cloudinary library version: {cloudinary.VERSION}")
except ImportError:
    print("❌ Cloudinary library NOT found")
