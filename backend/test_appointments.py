import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

def get_token():
    login_data = {"email": "new_test@example.com", "password": "password123", "name": "New Test"}
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        return response.json().get("access_token")
    
    # Try creating user if doesn't exist
    print("User not found, registering...")
    reg_data = {
        "email": "new_test@example.com",
        "password": "password123",
        "name": "New Test",
        "age": 30,
        "gender": "Male",
        "role": "PATIENT"
    }
    requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    return response.json().get("access_token")

def verify_appointments():
    print("--- Verifying Appointments API ---")
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Book a mock appointment
    future_date = (datetime.utcnow() + timedelta(days=2)).replace(microsecond=0)
    book_data = {
        "doctor_id": 1, # Assuming doctor 1 exists
        "appointment_datetime": future_date.isoformat() + "Z"
    }
    print("Booking test appointment...")
    book_res = requests.post(f"{BASE_URL}/patient/book-appointment", json=book_data, headers=headers)
    print(f"Book Status: {book_res.status_code}")
    
    # 2. Fetch My Appointments
    print("\nFetching My Appointments...")
    get_res = requests.get(f"{BASE_URL}/patient/appointments", headers=headers)
    print(f"Fetch Status: {get_res.status_code}")
    
    if get_res.status_code == 200:
        data = get_res.json()
        print(f"Found {len(data)} appointments.")
        if data:
            appt = data[0]
            print(f"Latest Appointment:")
            print(f"  Doctor: {appt.get('doctor_name')} ({appt.get('specialization')})")
            print(f"  Datetime: {appt.get('appointment_datetime')}")
            print(f"  Status: {appt.get('status')}")
            print(f"  Payment: {appt.get('payment_status')}")
    else:
        print(f"Error fetching: {get_res.text}")

if __name__ == "__main__":
    verify_appointments()
