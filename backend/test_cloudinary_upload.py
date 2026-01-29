from app import app, upload_file, CLOUDINARY_AVAILABLE
import os
import io

def test_mock_cloudinary_upload():
    print("Testing Mock Cloudinary Upload Logic...")
    print(f"CLOUDINARY_AVAILABLE: {CLOUDINARY_AVAILABLE}")
    
    # Create a mock file
    data = b'glb_content_mock'
    file = io.BytesIO(data)
    file.name = 'test_model.glb'
    
    with app.test_request_context(
        '/api/admin/model-upload',
        method='POST',
        data={'file': (file, 'test_model.glb')},
        content_type='multipart/form-data'
    ):
        try:
            # We are testing if the function executes without error
            # In local dev without keys, it might fallback to local storage (status 200 with local url)
            # In prod with keys, it should go to Cloudinary (status 200 with cloud url)
            from app import upload_file
            response = upload_file()
            
            print(f"Response Status: {response.status_code}")
            json_resp = response.get_json()
            print(f"Response Body: {json_resp}")
            
            if response.status_code == 200:
                if 'url' in json_resp:
                    print(f"SUCCESS: Upload handled. URL: {json_resp['url']}")
                else:
                    print("FAILURE: Success status but no URL returned")
            else:
                print(f"FAILURE: Status {response.status_code}")
                
        except Exception as e:
            print(f"Execution Error: {e}")

if __name__ == "__main__":
    test_mock_cloudinary_upload()
