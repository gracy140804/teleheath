import requests
import json

BASE_URL = "http://localhost:8000/api"

def get_token():
    login_data = {"email": "new_test@example.com", "password": "password123", "name": "New Test"}
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    return response.json().get("access_token")

def test_fix(text):
    print(f"\n--- Testing Fix: '{text}' ---")
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Submit
    requests.post(f"{BASE_URL}/patient/submit-symptoms", json={"raw_text": text}, headers=headers)
    
    # 2. Results
    res = requests.get(f"{BASE_URL}/patient/recommend-doctors", headers=headers)
    print(f"Status: {res.status_code}")
    try:
        data = res.json()
        if "detail" in data:
            print(f"API Error: {data['detail']}")
            return

        recs = data.get("recommended_doctors", [])
        if recs:
            print(f"Top Recommendation: {recs[0]['name']} ({recs[0]['specialization']}) | Score: {recs[0]['recommendation_score']}%")
            for i, doc in enumerate(recs[1:], 1):
                 print(f"#{i+1}: {doc['name']} ({doc['specialization']}) | Score: {doc['recommendation_score']}%")
        else:
            print("No recommendations found.")
    except Exception as e:
        print(f"Script Error: {e}")
        print(f"Raw Response: {res.text}")

if __name__ == "__main__":
    test_fix("fever 4 days")
