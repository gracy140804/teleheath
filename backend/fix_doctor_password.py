import sqlite3
import bcrypt

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

conn = sqlite3.connect('telehealth.db')
cursor = conn.cursor()

# Get the doctor's email
cursor.execute("SELECT email FROM users WHERE role='DOCTOR' LIMIT 1")
res = cursor.fetchone()
if res:
    email = res[0]
    hashed = get_password_hash("password123")
    cursor.execute("UPDATE users SET password_hash=? WHERE email=?", (hashed, email))
    conn.commit()
    print(f"Password hash updated for {email}")
else:
    print("No doctor found")

conn.close()
