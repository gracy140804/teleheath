from app.db.database import SessionLocal
from app.models.models import DoctorProfile, User
import sys
import os

db = SessionLocal()
doctors = db.query(DoctorProfile).all()
for d in doctors:
    u = db.query(User).filter(User.id == d.user_id).first()
    print(f"Doctor ID: {d.id}, Name: {u.name if u else 'Unknown'}")
db.close()
