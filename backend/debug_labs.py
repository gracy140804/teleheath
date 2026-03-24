import sys
import os

# Add the parent directory to sys.path to import the app module
sys.path.append(os.getcwd())

try:
    from app.db.database import SessionLocal, engine, Base
    from app.models import models
    from app.schemas import schemas
    from sqlalchemy.orm import Session
    
    print("Testing DB connection...")
    db = SessionLocal()
    
    print("Ensuring tables exist...")
    Base.metadata.create_all(bind=engine)
    
    print("Querying LabTests...")
    tests = db.query(models.LabTest).all()
    print(f"Found {len(tests)} tests.")
    
    if not tests:
        print("Seeding tests...")
        seed_tests = [
            {"name": "Complete Blood Count (CBC)", "description": "Measures components of blood.", "category": "Blood", "price": 450.0, "test_code": "CBC001"},
            {"name": "Lipid Profile", "description": "Measures cholesterol.", "category": "Blood", "price": 600.0, "test_code": "LP002"},
        ]
        for t in seed_tests:
            new_test = models.LabTest(**t)
            db.add(new_test)
        db.commit()
        print("Seeded successfully.")
        
    db.close()
    print("Diagnostic complete.")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
