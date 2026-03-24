import urllib.request
import urllib.parse
import json
import sqlite3

# Configuration
BASE_URL = "http://localhost:8000/api"
ROOM_ID = "room-22"
APPOINTMENT_ID = 22

# Authentication
login_data = urllib.parse.urlencode({
    "username": "doctor@aurahealth.com",
    "password": "Password123!"
}).encode('utf-8')

req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data)
try:
    with urllib.request.urlopen(req) as response:
        response_data = json.loads(response.read().decode())
        token = response_data.get("access_token")
        
        # Set up DB state
        conn = sqlite3.connect('telehealth.db')
        c = conn.cursor()
        c.execute("UPDATE appointments SET video_room_id=?, status='CONFIRMED' WHERE id=?", (ROOM_ID, APPOINTMENT_ID))
        conn.commit()
        conn.close()
        
        print("Set up test appointment 22 with room-22 in CONFIRMED state.")
        
        # Test endpoint
        print(f"Testing POST /video/{ROOM_ID}/finalize...")
        payload = json.dumps({
            "notes": "Patient condition is improving significantly. Proceed with current medication.",
            "follow_up_date": "2026-04-10"
        }).encode('utf-8')
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        finalize_req = urllib.request.Request(f"{BASE_URL}/video/{ROOM_ID}/finalize", data=payload, headers=headers)
        with urllib.request.urlopen(finalize_req) as finalize_res:
            print(f"Status Code: {finalize_res.getcode()}")
            print(f"Response: {finalize_res.read().decode()}")
            
            # Verify DB
            conn = sqlite3.connect('telehealth.db')
            c = conn.cursor()
            c.execute("SELECT status FROM appointments WHERE id=?", (APPOINTMENT_ID,))
            status = c.fetchone()[0]
            print(f"Appointment Status (expected 'COMPLETED'): {status}")
            
            c.execute("SELECT notes FROM prescriptions WHERE appointment_id=? ORDER BY id DESC LIMIT 1", (APPOINTMENT_ID,))
            note_row = c.fetchone()
            if note_row:
                print(f"Saved Notes: {note_row[0]}")
            else:
                print("ERROR: No notes saved in prescriptions table.")
            conn.close()
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error occurred: {e}")

