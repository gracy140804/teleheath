import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the project root to sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models import models

def migrate():
    engine = create_engine(DATABASE_URL)
    
    print(f"Running migrations on {DATABASE_URL}...")
    with engine.connect() as conn:
        # Appointment table
        columns = [c[1] for c in conn.execute(text("PRAGMA table_info(appointments)")).fetchall()]
        if 'rescheduled_datetime' not in columns:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN rescheduled_datetime DATETIME"))
            print("Added rescheduled_datetime to appointments")
        
        # DoctorAvailability table
        # Since PRAGMA table_info returns nothing if table doesn't exist
        tables = [t[0] for t in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()]
        if 'doctor_availabilities' not in tables:
            conn.execute(text("""
                CREATE TABLE doctor_availabilities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    doctor_id INTEGER,
                    date DATETIME,
                    start_time VARCHAR(10),
                    end_time VARCHAR(10),
                    slot_duration INTEGER DEFAULT 30,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY(doctor_id) REFERENCES doctor_profiles(id)
                )
            """))
            conn.execute(text("CREATE INDEX ix_doctor_availabilities_id ON doctor_availabilities (id)"))
            print("Created doctor_availabilities table")
        
        conn.commit()
    
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
