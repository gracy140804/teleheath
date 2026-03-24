from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())
from app.db.database import DATABASE_URL
from app.models import models

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("--- DESTRUCTIVE ACTION: WIPING USER DATABASE ---")

try:
    # Delete dependent profiles first to avoid FK constraints
    db.query(models.PatientProfile).delete()
    db.query(models.DoctorProfile).delete()
    db.query(models.DoctorAvailability).delete()
    db.query(models.Appointment).delete()
    db.query(models.SymptomRecord).delete()
    
    # Finally wipe all users
    num_deleted = db.query(models.User).delete()
    
    db.commit()
    print(f"✅ Successfully wiped {num_deleted} users and all associated profiles.")
except Exception as e:
    db.rollback()
    print(f"❌ Error during wipe: {str(e)}")
finally:
    db.close()
