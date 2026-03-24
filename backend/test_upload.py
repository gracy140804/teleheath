import requests
import os

# Login to get token
login_url = "http://localhost:8000/api/auth/login"
login_data = {"email": "patient@example.com", "password": "password123"}
response = requests.post(login_url, json=login_data)
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create a small dummy image
with open("test_avatar.png", "wb") as f:
    f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\x0dc\x44\xbb\x00\x00\x00\x00IEND\xaeB`\x82")

# Upload avatar
upload_url = "http://localhost:8000/api/patient/upload-avatar"
files = {"file": ("test_avatar.png", open("test_avatar.png", "rb"), "image/png")}
upload_res = requests.post(upload_url, headers=headers, files=files)

if upload_res.status_code == 200:
    print(f"Upload successful: {upload_res.json()}")
    # Check if user profile now has avatar_url
    profile_url = "http://localhost:8000/api/auth/me"
    profile_res = requests.get(profile_url, headers=headers)
    print(f"User Profile: {profile_res.json()}")
else:
    print(f"Upload failed: {upload_res.text}")

os.remove("test_avatar.png")
