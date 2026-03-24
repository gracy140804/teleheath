import sqlite3
import os

def check_vinith_spec():
    db_path = 'e:/final/backend/telehealth.db'
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- DOCTOR: VINITH ---")
    cursor.execute("SELECT u.name, d.specialization, d.is_approved, d.rating FROM users u JOIN doctor_profiles d ON u.id = d.user_id WHERE u.name LIKE '%vinith%'")
    row = cursor.fetchone()
    if row:
        print(f"Name: '{row[0]}'")
        print(f"Specialization: '{row[1]}'")
        print(f"Is Approved: {row[2]}")
        print(f"Rating: {row[3]}")
    else:
        print("Vinith not found!")
            
    conn.close()

if __name__ == "__main__":
    check_vinith_spec()
