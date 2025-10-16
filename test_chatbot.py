import requests
import json

url = "http://localhost:5000/api/chatbot"
headers = {"Content-Type": "application/json"}
data = {
    "message": "Hello, what can you help me with?",
    "history": []
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")