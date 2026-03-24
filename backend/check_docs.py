import sqlite3; conn = sqlite3.connect("telehealth.db"); cursor = conn.cursor(); cursor.execute("SELECT user_id, specialization, is_approved FROM doctor_profiles"); print(cursor.fetchall())
