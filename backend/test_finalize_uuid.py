import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000/api"
UUID_ROOM = "10f6fdc2-61fe-4cfd-898f-b4e4039d25f5"

try:
    login_data = urllib.parse.urlencode({"username": "doctor@aurahealth.com", "password": "Password123!"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data)
    with urllib.request.urlopen(req) as response:
        token = json.loads(response.read().decode())["access_token"]
        
    payload = json.dumps({"notes": "Test notes", "follow_up_date": "2026-04-10"}).encode('utf-8')
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    finalize_req = urllib.request.Request(f"{BASE_URL}/video/{UUID_ROOM}/finalize", data=payload, headers=headers)
    with urllib.request.urlopen(finalize_req) as finalize_res:
        print(f"Success! Status Code: {finalize_res.getcode()}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error occurred: {e}")
