import os
import sys
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from app.db.database import DATABASE_URL
from app.models.models import DoctorProfile, User

def check_department_counts():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()

    departments = [
        "General Physician", "Cardiologist", "Dermatologist", 
        "Orthopedic", "Neurologist", "Gastroenterologist", 
        "Psychiatrist", "ENT Specialist", "Ophthalmologist", 
        "Endocrinologist"
    ]

    print(f"{'Department':<25} | {'Count'}")
    print("-" * 35)

    for dept in departments:
        count = db.query(DoctorProfile).filter(DoctorProfile.specialization == dept).count()
        print(f"{dept:<25} | {count}")

    db.close()

if __name__ == "__main__":
    check_department_counts()
