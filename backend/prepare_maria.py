import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
cursor.execute("SELECT id, email, name FROM users WHERE role='DOCTOR' LIMIT 1")
doc = cursor.fetchone()
print(f"Doctor: {doc}")

if doc:
    doc_id = doc[0]
    # Ensure Jane (ID 55) has a pending appointment with this doctor
    cursor.execute("SELECT id FROM appointments WHERE patient_id=55 AND doctor_id=? AND status='PENDING' LIMIT 1", (doc_id,))
    appt = cursor.fetchone()
    if not appt:
        cursor.execute("INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status) VALUES (55, ?, datetime('now', '+1 hour'), 'PENDING')", (doc_id,))
        conn.commit()
        print("Created pending appointment for Jane with this doctor")
    else:
        print(f"Pending appointment already exists: ID {appt[0]}")

conn.close()
