import sqlite3
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()
cursor.execute("SELECT id, email FROM users WHERE email='jane@example.com'")
res = cursor.fetchone()
if res:
    user_id = res[0]
    print(f"Jane ID: {user_id}")
    cursor.execute("INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES (?, 'Consultation Update', 'Your appointment with Dr. Vinith has been accepted.', 'STATUS_CHANGE', 0, datetime('now'))", (user_id,))
    conn.commit()
    print("Notification inserted for Jane.")
else:
    print("Jane not found.")
conn.close()
