import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models import models
from app.services import ai_service

def verify_ortho_matching():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("--- Verifying Orthopedic Specialist Matching ---")
    
    # Test Case: Orthopedic Mapping
    print("\n[Test] Input: 'I have severe joint pain and fracture'")
    patient_context = {
        "symptoms": ["joint pain", "fracture"], 
        "severity": "High", 
        "recommended_spec": "Orthopedic"
    }
    
    recs = ai_service.recommend_doctors(patient_context, db=db)
    
    print(f"Total Recommendations: {len(recs)}")
    for i, rec in enumerate(recs):
        p = rec['profile']
        print(f"{i+1}. Dr. {p['name']} - Spec: {p['specialization']} - Rating: {p['rating']}")
        
    assert len(recs) == 3, "Must return exactly 3 doctors"
    assert recs[0]['profile']['specialization'] == "Orthopedic", "Top recommendation must be Orthopedic"
    
    print("\n--- Orthopedic Verification Successful ---")
    db.close()

if __name__ == "__main__":
    verify_ortho_matching()
