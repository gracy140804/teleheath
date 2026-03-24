import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()

# Get the doctor's email
cursor.execute("SELECT email FROM users WHERE role='DOCTOR' LIMIT 1")
res = cursor.fetchone()
if res:
    email = res[0]
    hashed = pwd_context.hash("password123")
    cursor.execute("UPDATE users SET password=? WHERE email=?", (hashed, email))
    conn.commit()
    print(f"Password reset for {email}")
else:
    print("No doctor found")

conn.close()
