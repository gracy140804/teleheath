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
        # DoctorProfile table
        columns = [c[1] for c in conn.execute(text("PRAGMA table_info(doctor_profiles)")).fetchall()]
        if 'qualification' not in columns:
            conn.execute(text("ALTER TABLE doctor_profiles ADD COLUMN qualification VARCHAR(255)"))
            print("Added qualification to doctor_profiles")
        if 'availability_schedule' not in columns:
            conn.execute(text("ALTER TABLE doctor_profiles ADD COLUMN availability_schedule JSON"))
            print("Added availability_schedule to doctor_profiles")
            
        # Appointment table
        columns = [c[1] for c in conn.execute(text("PRAGMA table_info(appointments)")).fetchall()]
        if 'booking_source' not in columns:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN booking_source VARCHAR(50) DEFAULT 'AI'"))
            print("Added booking_source to appointments")
        
        conn.commit()
    
    print("Seeding initial data...")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Update existing doctors with some data
    doctors = db.query(models.DoctorProfile).all()
    for doc in doctors:
        if not doc.qualification:
            doc.qualification = "MBBS, MD (Internal Medicine)"
        if not doc.availability_schedule:
            doc.availability_schedule = {
                "Monday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
                "Tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
                "Wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
                "Thursday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
                "Friday": ["09:00", "10:00", "11:00", "14:00", "15:00"]
            }
        print(f"Updated Doctor ID {doc.id}")
    
    db.commit()
    db.close()
    print("Migration and Seeding complete.")

if __name__ == "__main__":
    migrate()
