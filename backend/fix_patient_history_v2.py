import sqlite3

def fix_history():
    conn = sqlite3.connect('telehealth.db')
    cursor = conn.cursor()

    try:
        # 1. Update Appointment #14 specialist to Gastroenterologist (ID 26)
        cursor.execute("UPDATE appointments SET doctor_id = 26 WHERE id = 14")
        print("Updated Appointment #14 specialist to Gastroenterologist.")

        # 2. Update Patient #1 Profile Medical History
        cursor.execute("""
            UPDATE patient_profiles 
            SET medical_history = 'Hypertension (3 years), Seasonal Allergies, Appendectomy (2018)'
            WHERE id = 1
        """)
        print("Updated Patient #1 Medical History.")

        # 3. Ensure some past appointments are COMPLETED for history fetching
        # We need to find past appointments for patient_id = 1
        cursor.execute("SELECT id FROM appointments WHERE patient_id = 1 AND id != 14 LIMIT 2")
        past_ids = [row[0] for row in cursor.fetchall()]
        for pid in past_ids:
            cursor.execute("UPDATE appointments SET status = 'COMPLETED' WHERE id = ?", (pid,))
        print(f"Marked past appointments as COMPLETED: {past_ids}")

        # 4. Ensure there is at least one prescription for history fetching
        if past_ids:
            cursor.execute("SELECT id FROM prescriptions WHERE appointment_id = ?", (past_ids[0],))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO prescriptions (appointment_id, notes, file_url)
                    VALUES (?, 'Lansoprazole 30mg once daily. Avoid heavy meals before bed.', '/prescriptions/p101.pdf')
                """, (past_ids[0],))
                print(f"Added prescription for past appointment ID: {past_ids[0]}")

        # 5. Ensure there is at least one lab report
        cursor.execute("SELECT id FROM lab_appointments WHERE patient_id = 1 AND status = 'COMPLETED'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO lab_appointments (patient_id, test_id, appointment_datetime, status, provider_name, notes)
                VALUES (1, 1, '2026-03-12 11:00:00', 'COMPLETED', 'Metropolis Labs', 'CBC results normal. Mild dehydration detected.')
            """)
            print("Added completed lab report.")

        conn.commit()
        print("All history and specialist fixes applied successfully for Patient #1.")
    except Exception as e:
        conn.rollback()
        print(f"Error fixing history: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_history()
