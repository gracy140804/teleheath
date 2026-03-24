import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models import models
from app.services import ai_service

def verify_no_empty_recs():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("--- Verifying Guaranteed Recommendations (No Symptoms Case) ---")
    
    # Case: Empty symptoms
    empty_context = {"symptoms": [], "severity": "Moderate", "recommended_spec": "General Physician"}
    recs = ai_service.recommend_doctors(empty_context, db=db)
    
    print(f"Recommendations count for empty symptoms: {len(recs)}")
    assert len(recs) == 3, "Should return exactly 3 doctors even without symptoms"
    
    # Case: Random heart attack keyword check
    heart_context = {"symptoms": ["heart attack"], "severity": "High", "recommended_spec": "Cardiologist"}
    recs_heart = ai_service.recommend_doctors(heart_context, db=db)
    print(f"Recommendations count for heart symptoms: {len(recs_heart)}")
    assert len(recs_heart) == 3, "Should return exactly 3 doctors for heart symptoms"
    assert any(d['profile']['specialization'] == 'Cardiologist' for d in recs_heart), "Should contain Cardiologists"

    print("\n--- Verification Successful: Guaranteed Top 3 Doctors Enforced ---")
    db.close()

if __name__ == "__main__":
    verify_no_empty_recs()
