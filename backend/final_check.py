import requests
try:
    print(requests.get('http://localhost:8000/health').json())
except Exception as e:
    print(f"FAILED: {e}")
