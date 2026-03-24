import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models import models
from app.services import ai_service

def verify_universal_guarantee():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("--- Verifying Universal 4-Doctor Guarantee ---")
    
    test_cases = [
        {"name": "Psychiatrist (Empty DB)", "symptoms": ["anxiety"], "spec": "Psychiatrist"},
        {"name": "Orthopedic (Partial DB)", "symptoms": ["joint pain"], "spec": "Orthopedic"},
        {"name": "General Physician (Full DB)", "symptoms": ["fever"], "spec": "General Physician"}
    ]
    
    for test in test_cases:
        print(f"\n[Test] {test['name']}")
        patient_context = {
            "symptoms": test["symptoms"], 
            "severity": "Moderate", 
            "recommended_spec": test["spec"]
        }
        
        recs = ai_service.recommend_doctors(patient_context, db=db)
        print(f"Returned: {len(recs)} doctors")
        for i, rec in enumerate(recs):
            p = rec['profile']
            is_virt = p.get('is_virtual', False)
            print(f"  {i+1}. {p['name']} ({p['specialization']}) - Virtual: {is_virt}")
            
        assert len(recs) == 4, f"FAILED: Expected 4 doctors for {test['name']}, got {len(recs)}"
        assert recs[0]['profile']['specialization'] == test['spec'], f"FAILED: Top doctor for {test['name']} must be {test['spec']}"
    
    print("\n--- Universal Verification Successful ---")
    db.close()

if __name__ == "__main__":
    verify_universal_guarantee()
