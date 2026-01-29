from app import app
import os

def test_ar_file_download():
    print("Testing AR file download...")
    # Create a test client
    client = app.test_client()
    
    # Filename we know exists (from previous verification)
    filename = "20260129150618_potted_plant.glb"
    
    # Request the file
    try:
        response = client.get(f'/uploads/{filename}')
        
        print(f"Status Code: {response.status_code}")
        print(f"Content Type: {response.content_type}")
        print(f"Content Length: {response.content_length}")
        
        if response.status_code == 200:
            print("SUCCESS: File served correctly.")
        else:
            print(f"FAILURE: Could not serve file. Status: {response.status_code}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_ar_file_download()
