import requests
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def test_roles():
    print("Testing Staff Roles and Endpoints...")
    
    # 1. Test unauthorized access to staff endpoints
    print("\n1. Testing unauthorized access to /api/orders...")
    r = requests.get(f"{BASE_URL}/orders")
    if r.status_code == 401:
        print("PASS: Unauthorized access blocked with 401")
    else:
        print(f"FAIL: Expected 401, got {r.status_code}")

    print("\n2. Testing unauthorized access to /api/delivery/orders...")
    r = requests.get(f"{BASE_URL}/delivery/orders")
    if r.status_code == 401:
        print("PASS: Unauthorized access blocked with 401")
    else:
        print(f"FAIL: Expected 401, got {r.status_code}")

    print("\n3. Testing unauthorized access to /api/admin/create-staff...")
    r = requests.post(f"{BASE_URL}/admin/create-staff", json={})
    if r.status_code == 401:
        print("PASS: Unauthorized access blocked with 401")
    else:
        print(f"FAIL: Expected 401, got {r.status_code}")

    print("\nVerification script complete. (Note: Full role testing requires valid JWT tokens for different roles)")

if __name__ == "__main__":
    test_roles()
