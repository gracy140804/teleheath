import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
for row in cursor.execute('SELECT id, name, email FROM users'):
    print(row)
conn.close()
