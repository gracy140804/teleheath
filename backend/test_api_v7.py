from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())
from app.db.database import DATABASE_URL
from app.models import models
from app.services import ai_service

def test_api_logic():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("--- Testing AI Recommendation Logic ---")
    
    # Simulate a user with no symptoms
    patient_context = {"symptoms": [], "severity": "Moderate", "recommended_spec": "General Physician"}
    
    try:
        recs = ai_service.recommend_doctors(patient_context, db=db)
        print(f"Results for No Symptoms: {len(recs)} doctors returned.")
        for i, r in enumerate(recs):
            print(f"  {i+1}. {r['profile'].get('name')} - {r['profile'].get('specialization')}")
        
        # Test a niche spec
        patient_context = {"symptoms": ["anxiety"], "severity": "Moderate", "recommended_spec": "Psychiatrist"}
        recs = ai_service.recommend_doctors(patient_context, db=db)
        print(f"\nResults for Anxiety: {len(recs)} doctors returned.")
        for i, r in enumerate(recs):
            print(f"  {i+1}. {r['profile'].get('name')} - {r['profile'].get('specialization')}")
            
    except Exception as e:
        print(f"CRASH DETECTED: {str(e)}")
        import traceback
        traceback.print_exc()

    db.close()

if __name__ == "__main__":
    test_api_logic()
