import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
for row in cursor.execute('PRAGMA table_info(symptom_records)'):
    print(row)
conn.close()
