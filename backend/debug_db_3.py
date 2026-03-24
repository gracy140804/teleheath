import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
for row in cursor.execute('SELECT a.id, a.doctor_id, d.id as d_profile_id, d.user_id, u.email FROM appointments a JOIN doctor_profiles d ON a.doctor_id = d.id JOIN users u ON d.user_id = u.id WHERE a.id = 7'):
    print(row)
conn.close()
