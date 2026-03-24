import sqlite3
import json

def check_schema():
    conn = sqlite3.connect('telehealth.db')
    cursor = conn.cursor()
    
    # Get columns
    cursor.execute('PRAGMA table_info(symptom_records)')
    columns = cursor.fetchall()
    print("Columns in symptom_records:")
    for col in columns:
        print(col)
    
    # Check for Patient 1
    cursor.execute('SELECT * FROM symptom_records WHERE patient_id = 1')
    colnames = [d[0] for d in cursor.description]
    rows = cursor.fetchall()
    print("\nRows for Patient 1:")
    for row in rows:
        print(dict(zip(colnames, row)))
        
    conn.close()

if __name__ == "__main__":
    check_schema()
