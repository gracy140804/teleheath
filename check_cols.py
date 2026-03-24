import sqlite3
db_path = r'e:\final\backend\telehealth.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(patient_profiles);")
cols = cursor.fetchall()
print(f"Columns in patient_profiles: {[c[1] for c in cols]}")
conn.close()
