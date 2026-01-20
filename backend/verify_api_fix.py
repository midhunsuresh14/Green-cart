
import requests
import json

# URL of the local API (assuming default port 5000)
URL = "http://127.0.0.1:5000/api/weather/recommend"

# Test Case: The user's problematic scenario (High Temp, Low Humidity)
# Based on screenshot: Temp ~35.5C, Humidity ~33%
# Using a mocked pincode or direct coords if needed, but let's try to mimic the query params
# The user entered a pincode. Let's try to force the weather params via the weather_key mock or just parameters if I were mocking, 
# but here I have to rely on the actual API. 
# However, I can't easily force the OpenWeatherMap result to be 35C.
# BUT, I can see if the *logic* works by passing lat/lon that might be hot, or just checking if *any* query returns results now.

# Actually, I can rely on the fact that I changed the code. 
# Let's just try to hit the endpoint with a known valid query and see the structure of the response.
# If I can, I'll print the 'suitability_score' to prove the new logic is active.

try:
    # Use Mumbai coordinates as a baseline test
    response = requests.get(URL, params={"city": "Mumbai"})
    if response.status_code == 200:
        data = response.json()
        print("Success!")
        print(f"Weather: {data.get('weather')}")
        recs = data.get('recommendations', [])
        print(f"Found {len(recs)} recommendations")
        for i, crop in enumerate(recs[:5]):
            print(f"{i+1}. {crop['name']} - {crop.get('suitability')} (Score: {crop.get('suitability_score')})")
    else:
        print(f"Failed: {response.status_code} - {response.text}")

except Exception as e:
    print(f"Error: {e}")
    # If connection fails, it might mean the user hasn't started the backend or its on a different port.
    print("Could not connect to localhost:5000. Verification script requires running backend.")
