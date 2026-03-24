import requests
import json

BASE_URL = "http://localhost:8000/api"

def get_token():
    login_data = {"email": "new_test@example.com", "password": "password123", "name": "New Test"}
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    return response.json().get("access_token")

def verify_strict_mapping():
    print("--- Verifying Strict Symptom Mapping ---")
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Submit symptoms
    print("Submitting symptoms: 'high temperature and chills'")
    symp_data = {"raw_text": "high temperature and chills"}
    submit_res = requests.post(f"{BASE_URL}/patient/submit-symptoms", json=symp_data, headers=headers)
    extracted = submit_res.json().get("extracted_data", {})
    
    print(f"Detected Spec: {extracted.get('recommended_spec')}") # Should be General Physician
    
    # 2. Get recommendations
    print("\nFetching Recommendations...")
    rec_res = requests.get(f"{BASE_URL}/patient/recommend-doctors", headers=headers)
    
    if rec_res.status_code == 200:
        data = rec_res.json()
        print(f"Route Detected Spec: {data.get('detected_specialization')}")
        docs = data.get('recommended_doctors', [])
        print(f"Found {len(docs)} matching doctors.")
        
        for idx, item in enumerate(docs):
            doc = item.get("profile")
            print(f" {idx+1}. {doc.get('name')} - {doc.get('specialization')} (Rating: {doc.get('rating')}, Exp: {doc.get('experience')} yrs)")
            assert doc.get("specialization") == "General Physician", "ERROR: Invalid specialization in results!"
            
        print("\nMessage:")
        print(data.get("message", "No message provided"))
    else:
        print(f"Error fetching: {rec_res.text}")

if __name__ == "__main__":
    verify_strict_mapping()
