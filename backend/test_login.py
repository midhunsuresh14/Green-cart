import requests
import json

def test_login():
    """Test the login functionality"""
    # Test login endpoint
    url = "http://127.0.0.1:5000/api/login"
    
    # Admin credentials
    payload = {
        "email": "admin@greencart.local",
        "password": "Admin123!"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Login Status Code: {response.status_code}")
        print(f"Login Response: {response.json()}")
        
        if response.status_code == 200:
            print("✓ Login successful!")
            user_data = response.json().get('user', {})
            print(f"User data received: {user_data}")
            
            # Check if phone field is present
            if 'phone' in user_data:
                print("✓ Phone field is present in user data")
            else:
                print("✗ Phone field is missing from user data")
        else:
            print("✗ Login failed")
            
    except Exception as e:
        print(f"Error during login test: {e}")

if __name__ == "__main__":
    print("Testing login functionality...")
    test_login()
    print("Done.")