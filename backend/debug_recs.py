from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())
from app.db.database import DATABASE_URL
from app.models import models
from app.services import ai_service

def debug_query():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("--- Detailed Recommendation Debug ---")
    
    patient_context = {
        "symptoms": ["joint pain"], 
        "severity": "High", 
        "recommended_spec": "Orthopedic"
    }
    
    # Check what's in DB first
    all_docs = db.query(models.DoctorProfile).filter(models.DoctorProfile.is_approved == True).all()
    print(f"Total Approved Doctors in DB: {len(all_docs)}")
    for d in all_docs:
        print(f"DB Entry: {d.user.name}, Spec: [{d.specialization}], Approved: {d.is_approved}")

    # Run Recommendation
    recs = ai_service.recommend_doctors(patient_context, db=db)
    print(f"\nAI Service returned {len(recs)} recommendations:")
    for i, r in enumerate(recs):
        p = r['profile']
        print(f"{i+1}. {p['name']} - Spec: [{p['specialization']}]")

    db.close()

if __name__ == "__main__":
    debug_query()
