import urllib.request, urllib.parse, json
BASE_URL = "http://localhost:8000/api"

def get_token():
    data = urllib.parse.urlencode({"username": "doctor@aurahealth.com", "password": "Password123!"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())["access_token"]

def verify(token, room_id):
    req = urllib.request.Request(f"{BASE_URL}/video/auth/{room_id}")
    req.add_header('Authorization', f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as resp:
            print('Verify success:', resp.read().decode())
    except urllib.error.HTTPError as e:
        print('Verify error', e.code, e.read().decode())

if __name__ == '__main__':
    token = get_token()
    room_id = "10f6fdc2-61fe-4cfd-898f-b4e4039d25f5"
    verify(token, room_id)
