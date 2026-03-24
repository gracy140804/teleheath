import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.services import ai_service

def verify_emergency_flow():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()

    test_input = "I am having a HEART ATTACK and chest pain"
    
    print(f"Testing Input: {test_input}")
    print("-" * 50)
    
    # Pass the DB session to process_symptoms
    extraction = ai_service.process_symptoms(test_input, db=db)
    
    detected_spec = extraction["recommended_spec"]
    is_emergency = extraction["is_emergency"]
    summary = extraction["summary"]
    recs = extraction["recommendations"]
    
    print(f"Detected Spec: {detected_spec}")
    print(f"Is Emergency: {is_emergency}")
    print(f"Narrative Summary: {summary}")
    print(f"Number of Recommendations: {len(recs)}")
    
    if len(recs) > 0:
        first_doc_spec = recs[0]["profile"]["specialization"]
        print(f"Recommended Specialist Type: {first_doc_spec}")
    
    db.close()

    # Assertions
    assert "heart attack" in summary.lower(), "Summary should mention heart attack"
    assert is_emergency is True, "Should be flagged as emergency"
    assert detected_spec == "Cardiologist", "Should map to Cardiologist"
    assert len(recs) >= 5, "Should return at least 5 doctors (guarantee)"
    assert any(r["profile"]["specialization"] == "Cardiologist" for r in recs), "Should include Cardiologists"

    print("\n✅ EMERGENCY FLOW VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_emergency_flow()
