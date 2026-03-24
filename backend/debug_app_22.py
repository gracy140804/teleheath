import sys
import os

# Add the app directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'app'))

from db.database import SessionLocal
from models import models

def debug_appointment():
    db = SessionLocal()
    try:
        app_id = 22
        appointment = db.query(models.Appointment).filter(models.Appointment.id == app_id).first()
        if not appointment:
            print(f"Appointment {app_id} not found")
            return
            
        print(f"Appointment ID: {appointment.id}")
        print(f"Status: {appointment.status}")
        print(f"Patient ID: {appointment.patient_id}")
        print(f"Doctor ID: {appointment.doctor_id}")
        print(f"Video Room ID: {appointment.video_room_id}")
        
        if appointment.patient:
            print(f"Patient User: {appointment.patient.user.name if appointment.patient.user else 'No User'}")
        else:
            print("No Patient Profile found")
            
        if appointment.doctor:
            print(f"Doctor User: {appointment.doctor.user.name if appointment.doctor.user else 'No User'}")
            print(f"Specialization: {appointment.doctor.specialization}")
        else:
            print("No Doctor Profile found")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_appointment()
