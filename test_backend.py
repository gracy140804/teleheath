import requests
import json
try:
    url = "http://127.0.0.1:8000/api/patient/submit-symptoms"
    headers = {"Content-Type": "application/json"}
    # Simplified mock login to get token if needed?
    # No, skip token for a second to see if 401 appears (instead of Network Error)
    r = requests.post(url, json={"raw_text": "testing symptom submission"}, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
except Exception as e:
    print(f"Error: {e}")
