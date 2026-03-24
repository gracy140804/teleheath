import sqlite3
import os

db_path = "telehealth.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check current columns
    cursor.execute("PRAGMA table_info(symptom_records)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Current columns in symptom_records: {columns}")
    
    if "analysed_specialization" not in columns:
        try:
            cursor.execute("ALTER TABLE symptom_records ADD COLUMN analysed_specialization VARCHAR(255)")
            conn.commit()
            print("Successfully added analysed_specialization column.")
        except Exception as e:
            print(f"Failed to add column: {e}")
    else:
        print("analysed_specialization column already exists.")
        
    conn.close()
else:
    print(f"Database not found at {db_path}")
