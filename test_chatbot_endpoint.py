import requests
import json
import time

def test_chatbot_endpoint():
    url = "http://localhost:5000/api/chatbot"
    headers = {"Content-Type": "application/json"}
    data = {
        "message": "Hello, what can you help me with?",
        "history": []
    }
    
    try:
        print("Testing chatbot endpoint...")
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("Could not connect to the backend server. Make sure it's running on port 5000.")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_chatbot_endpoint()