import sqlite3
import os
import json

db_path = "telehealth.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get Appointment 22 details
    cursor.execute("SELECT patient_id, doctor_id FROM appointments WHERE id = 22")
    row = cursor.fetchone()
    if not row:
        print("Appointment 22 not found.")
        conn.close()
        exit()
        
    patient_id, doctor_id = row
    
    # Get Doctor's specialization
    cursor.execute("SELECT specialization FROM doctor_profiles WHERE id = ?", (doctor_id,))
    spec_row = cursor.fetchone()
    specialization = spec_row[0] if spec_row else "Cardiologist"
    
    # Insert a symptom record for this patient and specialization
    extracted_data = {
        "symptoms": [{"name": "Hypertension", "duration": "2 weeks", "severity": "Moderate"}],
        "possible_conditions": ["Primary Hypertension", "Chronic Hypertension"],
        "severity": "Moderate",
        "duration": "2 weeks"
    }
    
    cursor.execute("""
        INSERT INTO symptom_records 
        (patient_id, raw_text, analysed_specialization, extracted_data, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    """, (patient_id, "Patient has persistent hypertension for 2 weeks.", specialization, json.dumps(extracted_data)))
    
    conn.commit()
    print(f"Added symptom record for Patient {patient_id} with specialization {specialization}")
    conn.close()
else:
    print(f"Database not found at {db_path}")
