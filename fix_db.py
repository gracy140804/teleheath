import sqlite3
db_path = r'e:\final\backend\telehealth.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_cols(table, cols):
    cursor.execute(f"PRAGMA table_info({table});")
    existing = [c[1] for c in cursor.fetchall()]
    for col, type in cols:
        if col not in existing:
            print(f"Adding {col} to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {type};")

add_cols("patient_profiles", [("blood_group", "TEXT"), ("weight", "TEXT")])
add_cols("doctor_profiles", [("qualification", "TEXT"), ("consultation_fee", "REAL"), ("rating", "REAL"), ("is_approved", "INTEGER DEFAULT 0"), ("availability_schedule", "JSON")])
add_cols("appointments", [("video_room_id", "TEXT"), ("booking_source", "TEXT DEFAULT 'AI'"), ("payment_status", "TEXT DEFAULT 'UNPAID'")])
add_cols("users", [("avatar_url", "TEXT")])

conn.commit()
conn.close()
print("Migration done!")
