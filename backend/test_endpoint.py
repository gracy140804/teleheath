import requests
# Mocking a call locally
url = "http://localhost:8000/api/doctor/appointment/7/patient-profile"
# We need an auth token
# I'll just check if the URL returns anything (likely 401/403)
try:
    res = requests.get(url)
    print(res.status_code, res.text)
except Exception as e:
    print(e)
