import requests
import json

def test_vinith_recommendation():
    url = "http://localhost:8000/patient/recommend-doctors"
    # We need a dummy token if the endpoint is protected, but let's see if we can check the logic directly or via a mock login
    # Actually, I'll just check the AI service logic directly via a script to be sure
    pass

if __name__ == "__main__":
    # Direct logic check
    import sys
    import os
    sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..')))
    
    from app.services import ai_service
    from app.db.database import SessionLocal
    from app.models import models
    
    db = SessionLocal()
    try:
        # 1. Search for 'hypertension'
        context = {"symptoms": ["hypertension"], "recommended_spec": "Cardiologist"}
        recs = ai_service.recommend_doctors(context, db=db)
        
        print(f"--- Top 5 Recommended Doctors for Cardiology ---")
        found_vinith = False
        for i, rec in enumerate(recs):
            name = rec['profile']['name']
            rating = rec['profile']['rating']
            print(f"{i+1}. {name} (Rating: {rating})")
            if "Vinith" in name:
                found_vinith = True
        
        if found_vinith:
            print("\nSUCCESS: Vinith found in the top recommendations!")
        else:
            print("\nFAILURE: Vinith NOT found in the top recommendations.")
            
    finally:
        db.close()
