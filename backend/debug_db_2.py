import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
for row in cursor.execute('SELECT a.id, a.patient_id, p.id as p_profile_id, p.user_id FROM appointments a LEFT JOIN patient_profiles p ON a.patient_id = p.id WHERE a.id = 7'):
    print(row)
conn.close()
