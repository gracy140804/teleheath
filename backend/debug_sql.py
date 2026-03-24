from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
import logging

# Enable SQL logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

sys.path.append(os.getcwd())
from app.db.database import DATABASE_URL
from app.models import models
from app.services import ai_service

def debug_query_detailed():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("--- Detailed SQL Recommendation Debug ---")
    
    # 1. Check direct query
    print("\n[Step 1] Direct count query for Orthopedic:")
    count = db.query(models.DoctorProfile).filter(models.DoctorProfile.specialization == "Orthopedic").filter(models.DoctorProfile.is_approved == True).count()
    print(f"Direct Count: {count}")

    # 2. Run service recommendation
    patient_context = {
        "symptoms": ["joint pain"], 
        "severity": "High", 
        "recommended_spec": "Orthopedic"
    }
    
    print("\n[Step 2] Running recommend_doctors service:")
    recs = ai_service.recommend_doctors(patient_context, db=db)
    
    db.close()

if __name__ == "__main__":
    debug_query_detailed()
