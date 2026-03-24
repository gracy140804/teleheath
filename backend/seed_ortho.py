from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
from datetime import datetime

sys.path.append(os.getcwd())
from app.db.database import DATABASE_URL
from app.models import models
from app.core.auth import get_password_hash

def seed_ortho():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    print("--- Seeding Orthopedic Doctors ---")
    
    ortho_data = [
        {"name": "Robert Chen", "email": "robert.ortho@healthai.com", "rating": 4.9, "exp": 18, "fee": 800, "qual": "MS Ortho, FRCS"},
        {"name": "James Wilson", "email": "james.ortho@healthai.com", "rating": 4.7, "exp": 12, "fee": 600, "qual": "MS, DNB Orthopedics"},
        {"name": "Maria Garcia", "email": "maria.ortho@healthai.com", "rating": 4.8, "exp": 15, "fee": 700, "qual": "MS Orthopedics, Joint Specialist"}
    ]

    for data in ortho_data:
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == data["email"]).first()
        if not user:
            user = models.User(
                name=data["name"],
                email=data["email"],
                password_hash=get_password_hash("password123"),
                role=models.UserRole.DOCTOR
            )
            db.add(user)
            db.flush()
            
            profile = models.DoctorProfile(
                user_id=user.id,
                specialization="Orthopedic",
                experience=data["exp"],
                rating=data["rating"],
                consultation_fee=data["fee"],
                qualification=data["qual"],
                is_approved=True,
                availability_schedule='{"Monday": ["09:00", "14:00"], "Tuesday": ["10:00", "15:00"], "Wednesday": ["09:00", "14:00"], "Thursday": ["10:00", "15:00"], "Friday": ["09:00", "14:00"]}'
            )
            db.add(profile)
            print(f"Created Orthopedic: Dr. {data['name']}")
        else:
            # Update existing to be approved
            profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == user.id).first()
            if profile:
                profile.is_approved = True
                profile.specialization = "Orthopedic"
                profile.rating = data["rating"]
                print(f"Updated and Approved: Dr. {data['name']}")

    # Also force approve existing Cardiologist Dr. Sarah Smith recorded in previous step as not approved
    sarah = db.query(models.User).filter(models.User.name == "Sarah Smith").first()
    if sarah:
        p = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == sarah.id).first()
        if p:
            p.is_approved = True
            p.rating = 4.9
            print(f"Approved Dr. Sarah Smith")

    db.commit()
    db.close()
    print("--- Seeding Complete ---")

if __name__ == "__main__":
    seed_ortho()
