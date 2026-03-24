import urllib.request, json, urllib.error

BASE_URL = "http://localhost:8000/api"

def get_token():
    payload = json.dumps({"email": "doctor@aurahealth.com", "password": "Password123!"}).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())["access_token"]
    except urllib.error.HTTPError as e:
        print("Login error:", e.code, e.read().decode())
        return None

def finalize_system(token, room_id):
    payload = json.dumps({"room_id": room_id, "notes": "Test notes", "follow_up_date": "2026-04-10"}).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}/video/finalize-system",
        data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print("SUCCESS:", resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"ERROR {e.code}:", e.read().decode())

if __name__ == '__main__':
    token = get_token()
    if token:
        print("Login OK")
        finalize_system(token, "10f6fdc2-61fe-4cfd-898f-b4e4039d25f5")
    else:
        print("Login failed, cannot test finalize")
