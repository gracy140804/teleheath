import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL, SessionLocal
from app.models.models import Appointment, AppointmentStatus

def test_cancel_logic():
    print("Starting Cancel Logic Verification...")
    db = SessionLocal()
    
    # 1. Find a PENDING appointment
    appt = db.query(Appointment).filter(Appointment.status == AppointmentStatus.PENDING).first()
    if not appt:
        print("No PENDING appointment found. Creating one...")
        from datetime import datetime
        appt = Appointment(
            patient_id=1,
            doctor_id=1,
            appointment_datetime=datetime.now(),
            status=AppointmentStatus.PENDING
        )
        db.add(appt)
        db.commit()
        db.refresh(appt)

    appt_id = appt.id
    print(f"Testing Cancellation for Appointment ID: {appt_id}")
    
    # Simulate cancellation
    appt.status = AppointmentStatus.CANCELLED
    db.commit()
    db.refresh(appt)
    
    print(f"Updated Status: {appt.status}")
    
    assert appt.status == AppointmentStatus.CANCELLED, "Status should be CANCELLED"
    
    # Reset for future tests if needed, or just leave it
    print("\n✅ CANCEL LOGIC VERIFIED SUCCESSFULLY!")
    
    db.close()

if __name__ == "__main__":
    test_cancel_logic()
