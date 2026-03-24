import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000/api"

# login
def get_token():
    login_data = urllib.parse.urlencode({"username": "doctor@aurahealth.com", "password": "Password123!"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())["access_token"]

def finalize(token, room_id):
    payload = json.dumps({"room_id": room_id, "notes": "Test notes", "follow_up_date": "2026-04-10"}).encode('utf-8')
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"{BASE_URL}/video/finalize-system", data=payload, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            print("Success", resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")

if __name__ == '__main__':
    token = get_token()
    # Use a known room id from DB
    room_id = "10f6fdc2-61fe-4cfd-898f-b4e4039d25f5"
    finalize(token, room_id)
