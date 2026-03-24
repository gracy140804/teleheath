import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models import models
from app.services.ai_service import process_symptoms

def verify_db_persistence():
    db = SessionLocal()
    try:
        # 1. Create a dummy patient if none exists
        patient = db.query(models.PatientProfile).first()
        if not patient:
            user = models.User(name="Test Patient", email="test@example.com", password_hash="hash")
            db.add(user)
            db.commit()
            patient = models.PatientProfile(user_id=user.id)
            db.add(patient)
            db.commit()
        
        # 2. Process a mixed input
        raw_text = "எனக்கு காய்ச்சல் இருக்கு"
        processed = process_symptoms(raw_text, "Auto Detect")
        
        # 3. Create a record
        new_record = models.SymptomRecord(
            patient_id=patient.id,
            raw_text=raw_text,
            original_speech_text=processed.get("original_speech_text"),
            detected_language=processed.get("detected_language"),
            translated_text=processed.get("translated_text"),
            extracted_data=processed
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        
        print(f"Record Created with ID: {new_record.id}")
        print(f"Original Text Match: {new_record.original_speech_text == raw_text}")
        print(f"Detected Lang: {new_record.detected_language}")
        print(f"Translated Text: {new_record.translated_text}")
        
        assert new_record.detected_language == "Tamil"
        assert "fever" in new_record.translated_text.lower()
        print("Database Persistence PASS")
        
    finally:
        db.close()

if __name__ == "__main__":
    verify_db_persistence()
