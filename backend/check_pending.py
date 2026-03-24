from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
import sys
import os

# Adjust path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models import models

engine = create_engine("sqlite:///telehealth.db")

with Session(engine) as session:
    stmt = select(models.Appointment).where(models.Appointment.status == "PENDING")
    pending = session.execute(stmt).scalars().all()
    print(f"Found {len(pending)} pending appointments")
    for appt in pending:
        print(f"ID: {appt.id}, Patient ID: {appt.patient_id}, Doctor ID: {appt.doctor_id}, Time: {appt.appointment_datetime}")
