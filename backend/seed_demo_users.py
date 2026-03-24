import os
import sys
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models.models import User, UserRole, PatientProfile, DoctorProfile

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_demo_users():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    demo_users = [
        {
            "email": "jane@example.com",
            "name": "Jane Doe",
            "password": "password123",
            "role": UserRole.PATIENT
        },
        {
            "email": "sarah@example.com",
            "name": "Dr. Sarah Miller",
            "password": "password123",
            "role": UserRole.DOCTOR
        },
        {
            "email": "admin@healthai.com",
            "name": "System Admin",
            "password": "admin123",
            "role": UserRole.ADMIN
        }
    ]

    print("--- Seeding Demo Users ---")

    for u_data in demo_users:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if existing:
            print(f"✅ User already exists: {u_data['email']}")
            continue

        user = User(
            email=u_data["email"],
            name=u_data["name"],
            password_hash=hash_password(u_data["password"]),
            role=u_data["role"]
        )
        db.add(user)
        db.flush()

        if u_data["role"] == UserRole.PATIENT:
            profile = PatientProfile(user_id=user.id, age=30, gender="Female")
            db.add(profile)
        elif u_data["role"] == UserRole.DOCTOR:
            profile = DoctorProfile(
                user_id=user.id,
                specialization="General Physician",
                experience=10,
                consultation_fee=500,
                rating=4.8,
                is_approved=True
            )
            db.add(profile)
        
        print(f"➕ Created {u_data['role']} User: {u_data['email']}")

    db.commit()
    print("--- Seeding Complete ---")
    db.close()

if __name__ == "__main__":
    seed_demo_users()
