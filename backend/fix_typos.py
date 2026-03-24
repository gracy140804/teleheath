import sqlite3
import os

def fix_vinith():
    db_path = 'e:/final/backend/telehealth.db'
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Fix Specialization Typo
    print("Fixing Vinith's specialization...")
    cursor.execute("UPDATE doctor_profiles SET specialization = 'Cardiologist' WHERE user_id = (SELECT id FROM users WHERE name LIKE '%vinith%')")
    
    # 2. Fix Name (Capitalize and remove any 'Dr.' if it makes things double)
    # The frontend adds 'Dr.', so DB should probably have the plain name.
    print("Fixing Vinith's name...")
    cursor.execute("UPDATE users SET name = 'Vinith' WHERE name LIKE '%vinith%'")
    
    # 3. Fix other doctor names to be plain (remove 'Dr.' prefix) to avoid 'Dr. Dr.' in UI
    print("Normalizing other doctor names...")
    cursor.execute("UPDATE users SET name = REPLACE(name, 'Dr. ', '') WHERE name LIKE 'Dr. %'")
    
    conn.commit()
    print("Success: Database updated.")
    conn.close()

if __name__ == "__main__":
    fix_vinith()
