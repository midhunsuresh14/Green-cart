"""
Test script for Cloudinary upload functionality
"""

import requests
import base64
import os

def test_cloudinary_upload():
    # Create a simple test image (1x1 pixel PNG in base64)
    test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    test_image_path = "test-image.png"
    
    # Write the base64 image to a file
    with open(test_image_path, "wb") as f:
        f.write(base64.b64decode(test_image_b64))
    print(f"Created test image: {test_image_path}")
    
    # Convert image to base64 data URI
    image_data = f"data:image/png;base64,{test_image_b64}"
    
    # Send POST request to the upload endpoint
    url = "http://127.0.0.1:5000/api/cloudinary-upload"
    payload = {
        "image": image_data
    }
    
    # Note: We're not including authentication headers since this endpoint should be public
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Cloudinary upload test successful!")
            print(f"Uploaded image URL: {response.json().get('url')}")
        else:
            print("❌ Cloudinary upload test failed!")
            
    except Exception as e:
        print(f"Error during request: {e}")

if __name__ == "__main__":
    test_cloudinary_upload()