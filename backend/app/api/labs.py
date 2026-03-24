from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from ..api import deps
from typing import List, Dict, Any

router = APIRouter(prefix="/labs", tags=["labs"])

@router.get("/tests", response_model=List[schemas.LabTestResponse])
def get_lab_tests(db: Session = Depends(get_db)):
    tests = db.query(models.LabTest).all()
    if not tests:
        # Seed some data if empty
        seed_tests = [
            {"name": "Complete Blood Count (CBC)", "description": "Measures components of blood, including RBC, WBC, and platelets.", "category": "Blood", "price": 450.0, "test_code": "CBC001"},
            {"name": "Lipid Profile", "description": "Measures cholesterol and triglyceride levels.", "category": "Blood", "price": 600.0, "test_code": "LP002"},
            {"name": "Blood Glucose", "description": "Measures sugar levels in blood.", "category": "Diabetes", "price": 200.0, "test_code": "BG003"},
            {"name": "Thyroid Profile (T3, T4, TSH)", "description": "Measures thyroid hormone levels.", "category": "Hormones", "price": 850.0, "test_code": "THY004"},
            {"name": "Liver Function Test (LFT)", "description": "Assess liver health.", "category": "Organ Profile", "price": 750.0, "test_code": "LFT005"}
        ]
        for t in seed_tests:
            new_test = models.LabTest(**t)
            db.add(new_test)
        db.commit()
        tests = db.query(models.LabTest).all()
    return tests

@router.get("/providers", response_model=List[str])
def get_lab_providers():
    return ["City General Labs", "HealthAI Diagnostics", "Metro Scan Center", "Sunrise Pathology"]

@router.post("/book", response_model=schemas.LabAppointmentResponse)
def book_lab_appointment(
    appointment: schemas.LabAppointmentBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT]))
):
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    new_appt = models.LabAppointment(
        patient_id=profile.id,
        test_id=appointment.test_id,
        appointment_datetime=appointment.appointment_datetime,
        provider_name=appointment.provider_name,
        notes=appointment.notes,
        status=models.AppointmentStatus.PENDING
    )
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return new_appt
