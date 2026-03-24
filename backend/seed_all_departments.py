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
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_all_departments():
    engine = create_engine(DATABASE_URL)
    SessionSession = sessionmaker(bind=engine)
    db = SessionSession()

    departments = [
        "General Physician", "Cardiologist", "Dermatologist", 
        "Orthopedic", "Neurologist", "Gastroenterologist", 
        "Psychiatrist", "ENT Specialist", "Ophthalmologist", 
        "Endocrinologist"
    ]

    doctor_names = {
        "General Physician": "Dr. Sarah Miller",
        "Cardiologist": "Dr. Robert Chen",
        "Dermatologist": "Dr. Elena Gilbert",
        "Orthopedic": "Dr. James Wilson",
        "Neurologist": "Dr. Gregory House",
        "Gastroenterologist": "Dr. Meredith Grey",
        "Psychiatrist": "Dr. Hannibal Lecter",
        "ENT Specialist": "Dr. Stephen Strange",
        "Ophthalmologist": "Dr. Amy Pond",
        "Endocrinologist": "Dr. Clara Oswald"
    }

    print("--- Seeding Real Doctors for All 10 Departments ---")

    for dept in departments:
        # Check if doctor profile already exists for this dept
        existing = db.query(DoctorProfile).filter(DoctorProfile.specialization == dept).first()
        if existing:
            print(f"✅ Specialist already exists for {dept}: {existing.user.name}")
            continue

        # Create User
        name = doctor_names.get(dept, f"Dr. {dept} Expert")
        email = f"clinical_{dept.lower().replace(' ', '_')}@healthai.com"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                name=name,
                password_hash=hash_password("Doctor@123"),
                role=UserRole.DOCTOR
            )
            db.add(user)
            db.flush() # Get ID
            print(f"➕ Created User: {name} ({email})")
        else:
            print(f"ℹ️ User already exists for {dept}")

        # Create Doctor Profile
        profile = DoctorProfile(
            user_id=user.id,
            specialization=dept,
            qualification="MD, Board Certified Specialist",
            experience=random.randint(8, 22),
            consultation_fee=random.choice([400, 500, 600, 750]),
            rating=round(random.uniform(4.5, 5.0), 1),
            is_approved=True
        )
        db.add(profile)
        db.flush()

        # Add Availabiltiy slots
        now = datetime.now()
        for i in range(1, 3): # Tomorrow and next day
            date_target = now + timedelta(days=i)
            slots = [("10:00", "11:00"), ("14:00", "15:00")]
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

        print(f"🏥 Seeded {dept} specialist with real database records.")

    db.commit()
    print("\n--- Seeding Operation Complete ---")
    db.close()

if __name__ == "__main__":
    seed_all_departments()
