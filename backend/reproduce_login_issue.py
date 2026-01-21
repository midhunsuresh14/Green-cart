import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def debug_login():
    print("Starting Staff Login Debugging...")
    
    # 1. Create a test staff member (requires admin login first)
    # Since I don't have an admin login handy in the script, I'll try to find an existing admin or just try a login with a known account if possible.
    # Alternatively, I can just test the login endpoint with raw data to see if it even accepts JSON properly.
    
    test_data = {
        "email": "test_staff@example.com",
        "password": "password123"
    }
    
    print(f"\nTesting login with: {test_data}")
    try:
        r = requests.post(f"{BASE_URL}/login", json=test_data)
        print(f"Status Code: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    debug_login()
