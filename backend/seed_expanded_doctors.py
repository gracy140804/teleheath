import os
import sys
import random
import bcrypt
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models.models import DoctorProfile, User, UserRole, DoctorAvailability

def hash_password(password: str) -> str:
    # Use standard library hash for speed in seeding if needed, or bcrypt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_expanded_doctors():
    engine = create_engine(DATABASE_URL)
    SessionSession = sessionmaker(bind=engine)
    db = SessionSession()

    departments = [
        "General Physician", "Cardiologist", "Dermatologist", 
        "Orthopedic", "Neurologist", "Gastroenterologist", 
        "Psychiatrist", "ENT Specialist", "Ophthalmologist", 
        "Endocrinologist"
    ]

    doctor_prefixes = ["Dr. Sarah", "Dr. James", "Dr. Robert", "Dr. Elena", "Dr. Michael", "Dr. Linda", "Dr. David", "Dr. Maria"]
    doctor_surnames = ["Miller", "Wilson", "Chen", "Gilbert", "Smith", "Johnson", "Brown", "Garcia", "Lee", "Taylor"]

    print("--- Seeding 5 Doctors per Department (Total 50 Specialists) ---")

    for dept in departments:
        print(f"\n🏥 Seeding {dept}...")
        for i in range(1, 6): # 5 doctors per dept
            fname = random.choice(doctor_prefixes)
            lname = random.choice(doctor_surnames)
            name = f"{fname} {lname}"
            email = f"{dept.lower().replace(' ', '_')}_doc_{i}@healthai.com"
            
            # Check if user exists
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    name=name,
                    password_hash=hash_password("Doctor@123"),
                    role=UserRole.DOCTOR
                )
                db.add(user)
                db.flush()
            
            # Create or update Profile
            profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
            if not profile:
                profile = DoctorProfile(
                    user_id=user.id,
                    specialization=dept,
                    qualification="MD, Specialist Certification",
                    experience=random.randint(5, 25),
                    consultation_fee=random.choice([300, 450, 600, 800]),
                    rating=round(random.uniform(4.2, 5.0), 1),
                    is_approved=True
                )
                db.add(profile)
                db.flush()

            # Add availability slots for the next 3 days
            now = datetime.now()
            for day in range(1, 4):
                date_target = now + timedelta(days=day)
                # 3 slots per day
                slots = [("09:00", "10:00"), ("11:00", "12:00"), ("15:00", "16:00")]
                for start, end in slots:
                    availability = DoctorAvailability(
                        doctor_id=profile.id,
                        date=date_target,
                        start_time=start,
                        end_time=end,
                        slot_duration=30,
                        is_active=True
                    )
                    db.add(availability)
            
            print(f"  ✅ {name} added.")

    db.commit()
    print("\n--- Expansion Seeding Complete: 50 Doctors Available ---")
    db.close()

if __name__ == "__main__":
    seed_expanded_doctors()
