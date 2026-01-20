import requests
import json

def test_recommendation_api():
    base_url = "http://localhost:5000/api/weather/recommend"
    
    # Test cases
    test_params = [
        {"city": "Mumbai"}, # Should use fallback demo data if no API key
        {"lat": "19.0760", "lon": "72.8777"}, # Coordinates
        {"pincode": "400001"} # Pincode
    ]
    
    for params in test_params:
        print(f"\nTesting with params: {params}")
        try:
            response = requests.get(base_url, params=params)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"City Detected: {data['weather']['city']}")
                print(f"Temperature: {data['weather']['temp']}°C")
                print(f"Humidity: {data['weather']['humidity']}%")
                print(f"Recommendations Count: {len(data['recommendations'])}")
                if data['recommendations']:
                    first = data['recommendations'][0]
                    print(f"Top Recommendation: {first['name']} ({first['suitability']})")
                    print(f"AI Explanation Snippet: {first['explanation'][:60]}...")
            else:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Failed to connect: {e}")

if __name__ == "__main__":
    # Note: Requires the Flask server to be running.
    # Since I can't guarantee the server is up in this environment's terminal background 
    # without starting it, I'll just check if I can start it briefly or assume it's working 
    # if I can verify the internal logic.
    print("Beginning API Verification...")
    test_recommendation_api()
