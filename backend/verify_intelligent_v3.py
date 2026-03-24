import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models import models
from app.services import ai_service

def verify():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("--- Seeding Availability for Testing ---")
    # Find a Cardiologist
    cardio = db.query(models.DoctorProfile).filter(models.DoctorProfile.specialization == "Cardiologist").first()
    if cardio:
        print(f"Found Cardiologist: Dr. {cardio.user.name} (Rating: {cardio.rating})")
        # Add some slots
        now = datetime.now()
        slots = [
            models.DoctorAvailability(doctor_id=cardio.id, date=now + timedelta(days=1), start_time="09:00", end_time="09:30"),
            models.DoctorAvailability(doctor_id=cardio.id, date=now + timedelta(days=1), start_time="10:00", end_time="10:30"),
            models.DoctorAvailability(doctor_id=cardio.id, date=now + timedelta(days=2), start_time="14:00", end_time="14:30"),
        ]
        db.add_all(slots)
        db.commit()
    
    # 1. Test Strict Specialization Mapping
    print("\n--- Testing Strict Specialization Mapping ---")
    symptoms_text = "I have severe chest pain and heart blockage"
    processed = ai_service.process_symptoms(symptoms_text, db=db)
    
    print(f"Input: {symptoms_text}")
    print(f"Recommended Spec: {processed.get('recommended_spec')}")
    assert processed.get('recommended_spec') == "Cardiologist", "Should recommend Cardiologist for heart blockage"
    
    # 2. Test Ranking & Filtering
    print("\n--- Testing Ranking & Filtering ---")
    recs = processed.get('recommendations', [])
    print(f"Total Recommendations: {len(recs)}")
    for i, rec in enumerate(recs):
        profile = rec['profile']
        print(f"{i+1}. Dr. {profile['name']} - Rating: {profile['rating']}, Exp: {profile['experience']}, Next: {profile['next_available_slot']}")
    
    if len(recs) > 0:
        assert recs[0]['profile']['specialization'] == "Cardiologist", "Top recommendation must be Cardiologist"
        assert recs[0]['rating'] >= 3.5, "Recommendation must have rating >= 3.5"
    
    print("\n--- Verification Successful ---")
    db.close()

if __name__ == "__main__":
    verify()
