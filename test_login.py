import urllib.request
import json

url = "http://127.0.0.1:8000/api/auth/login"
data = json.dumps({"email": "gracysahayam@gmail.com", "password": "gracy123"}).encode()
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        result = json.loads(resp.read())
        print(f"SUCCESS! Role: {result['role']}, Token received: {bool(result.get('access_token'))}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP ERROR {e.code}: {body}")
except Exception as e:
    print(f"CONNECTION ERROR: {e}")
