import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

from app.services import ai_service
from app.api import patient
from app.db.database import SessionLocal
from app.models import models

def verify_booking_logic():
    print("--- Verifying Manual Booking Backend Logic ---")
    
    # 1. Verify Departments
    depts = patient.get_departments()
    print(f"Found {len(depts)} Departments. First: {depts[0]['name']}")
    assert len(depts) >= 10
    assert depts[0]['name'] == "General Physician"
    
    # 2. Verify Specialist Filtering
    db = SessionLocal()
    try:
        # Get a Cardiologist
        specialists = patient.get_specialists("Cardiologist", db)
        print(f"Found {len(specialists)} Cardiologists.")
        for s in specialists:
            # Note: The 'name' property is a dynamic property in our schema-enriched list
            # But here we look at the SQLAlchemy model
            from app.models.models import User
            user = db.query(User).filter(User.id == s.user_id).first()
            print(f"- Dr. {user.name} ({s.qualification})")
            assert s.specialization == "Cardiologist"
            assert s.is_approved is True
            assert s.availability_schedule is not None
            
        print("\n✅ Backend logic for manual booking is verified.")
    finally:
        db.close()

if __name__ == "__main__":
    verify_booking_logic()
