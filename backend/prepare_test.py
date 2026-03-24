import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
cursor.execute("SELECT id, email, name FROM users WHERE role='DOCTOR'")
doctors = cursor.fetchall()
print("Doctors:", doctors)

# Find an appointment for Jane (ID 55) that is PENDING
cursor.execute("SELECT id, patient_id, doctor_id, status FROM appointments WHERE patient_id=55 AND status='PENDING' LIMIT 1")
appt = cursor.fetchone()
print("Pending Appointment for Jane:", appt)

if not appt:
    # Create a pending appointment for Jane with the first doctor
    if doctors:
        doc_id = doctors[0][0]
        cursor.execute("INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status) VALUES (55, ?, datetime('now', '+1 hour'), 'PENDING')", (doc_id,))
        conn.commit()
        cursor.execute("SELECT id, patient_id, doctor_id, status FROM appointments WHERE patient_id=55 AND status='PENDING' LIMIT 1")
        appt = cursor.fetchone()
        print("Created Pending Appointment:", appt)

conn.close()
