import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
for row in cursor.execute('SELECT id, status FROM appointments'):
    print(row)
conn.close()
