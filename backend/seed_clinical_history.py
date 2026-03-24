import sqlite3
from datetime import datetime, timedelta

def seed_data():
    conn = sqlite3.connect('telehealth.db')
    cursor = conn.cursor()

    try:
        # 1. Update Appointment #15 to Gastroenterologist (ID 26)
        cursor.execute("UPDATE appointments SET doctor_id = 26 WHERE id = 15")
        print("Updated Appointment #15 specialist to Gastroenterologist.")

        # 2. Add a Completed Past Appointment for Patient 1
        past_date = (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status, payment_status, booking_source)
            VALUES (1, 26, ?, 'COMPLETED', 'PAID', 'MANUAL')
        """, (past_date,))
        past_app_id = cursor.lastrowid
        print(f"Added past completed appointment ID: {past_app_id}")

        # 3. Add a Prescription for that past appointment
        cursor.execute("""
            INSERT INTO prescriptions (appointment_id, notes, file_url)
            VALUES (?, 'Lansoprazole 30mg once daily for 7 days. Avoid spicy food.', '/prescriptions/p101.pdf')
        """, (past_app_id,))
        print("Added prescription for past appointment.")

        # 4. Add a Lab Appointment (Completed)
        lab_date = (datetime.now() - timedelta(days=8)).strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO lab_appointments (patient_id, test_id, appointment_datetime, status, provider_name, notes)
            VALUES (1, 1, ?, 'COMPLETED', 'Metropolis Labs', 'CBC results normal. Mild dehydration detected.')
        """, (lab_date,))
        print("Added completed lab report.")

        # 5. Add another past visit with a different specialist (e.g. Cardiologist) for history
        cursor.execute("SELECT id FROM doctor_profiles WHERE specialization = 'Cardiologist' LIMIT 1")
        cardio_id = cursor.fetchone()[0]
        past_cardio_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status, payment_status, booking_source)
            VALUES (1, ?, ?, 'COMPLETED', 'PAID', 'MANUAL')
        """, (cardio_id, past_cardio_date))
        print("Added past cardiology visit.")

        conn.commit()
        print("All clinical data seeded successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error seeding data: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_data()
