import sqlite3
db_path = r'e:\final\backend\telehealth.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print(f"Tables in {db_path}: {[t[0] for t in tables]}")
conn.close()
