import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
cursor.execute("SELECT email, name FROM users WHERE role='DOCTOR' LIMIT 1")
doc = cursor.fetchone()
print(f"Doctor: {doc}")
conn.close()
