import sqlite3
import os
from datetime import datetime, timedelta

DB_PATH = r"e:\final\backend\telehealth.db"

def check_notifications():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("--- User Notifications ---")
    cursor.execute("SELECT id, user_id, title, message, type, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT 5")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, UserID: {row[1]}, Title: {row[2]}, Msg: {row[3][:50]}..., Type: {row[4]}, Read: {row[5]}, At: {row[6]}")
    
    conn.close()

def simulate_doctor_action():
    # Simulate a doctor accepting an appointment (ID 1)
    # We'll just insert a notification manually to verify the model/table works
    # then we'll check the doctor API logic via DB if needed.
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get a user (e.g., patient user_id = 1)
    cursor.execute("SELECT id FROM users LIMIT 1")
    user_id = cursor.fetchone()[0]
    
    print(f"\nSimulating notification for User ID: {user_id}")
    cursor.execute("""
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (?, 'Test Notification', 'This is a test notification for verification.', 'STATUS_CHANGE', 0, ?)
    """, (user_id, datetime.now().isoformat()))
    
    conn.commit()
    print("Notification inserted.")
    conn.close()

if __name__ == "__main__":
    if os.path.exists(DB_PATH):
        simulate_doctor_action()
        check_notifications()
    else:
        print(f"Database not found at {DB_PATH}")
