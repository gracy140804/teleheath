from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from ..api import deps
from ..services.notification_service import notification_service
from typing import List, Any, Dict

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[schemas.UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN]))
):
    return db.query(models.User).all()

@router.get("/pending-doctors", response_model=List[schemas.DoctorProfileResponse])
def get_pending_doctors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN]))
):
    doctors = db.query(models.DoctorProfile).filter(models.DoctorProfile.is_approved == False).all()
    # Need to manually construct doctor responses with names
    result = []
    for doc in doctors:
        doc_resp = schemas.DoctorProfileResponse.from_orm(doc)
        doc_resp.name = doc.user.name
        result.append(doc_resp)
    return result

@router.get("/doctors", response_model=List[Dict[str, Any]])
def get_doctors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN]))
):
    doctors = db.query(models.DoctorProfile, models.User).join(models.User, models.DoctorProfile.user_id == models.User.id).all()
    
    result = []
    for doc, user in doctors:
        result.append({
            "id": doc.id,
            "name": user.name,
            "email": user.email,
            "specialization": doc.specialization,
            "experience": doc.experience,
            "consultation_fee": doc.consultation_fee,
            "rating": doc.rating,
            "status": "APPROVED" if doc.is_approved else "PENDING"
        })
    return result

@router.post("/approve-doctor")
def approve_doctor(
    doctor_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN]))
):
    doctor = db.query(models.DoctorProfile).filter(models.DoctorProfile.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    doctor.is_approved = True
    db.commit()
    return {"message": "Doctor approved successfully"}

@router.post("/reject-doctor")
def reject_doctor(
    doctor_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN]))
):
    doctor = db.query(models.DoctorProfile).filter(models.DoctorProfile.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    doctor.is_approved = False
    db.commit()
    return {"message": "Doctor rejected/suspended successfully"}

@router.get("/doctor/{doctor_id}")
def get_doctor_details(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN]))
):
    doctor = db.query(models.DoctorProfile, models.User).join(models.User, models.DoctorProfile.user_id == models.User.id).filter(models.DoctorProfile.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doc, user = doctor
    return {
        "id": doc.id,
        "name": user.name,
        "email": user.email,
        "specialization": doc.specialization,
        "qualification": doc.qualification,
        "experience": doc.experience,
        "consultation_fee": doc.consultation_fee,
        "rating": doc.rating,
        "is_approved": doc.is_approved,
        "phone": user.phone
    }

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN]))
):
    total_users = db.query(models.User).count()
    total_patients = db.query(models.User).filter(models.User.role == models.UserRole.PATIENT).count()
    total_doctors = db.query(models.User).filter(models.User.role == models.UserRole.DOCTOR).count()
    total_appointments = db.query(models.Appointment).count()
    
    return {
        "total_users": total_users,
        "patients": total_patients,
        "doctors": total_doctors,
        "appointments": total_appointments,
        "active_sessions": 24, # Mock stat
        "platform_growth": "+15%" # Mock stat
    }

@router.get("/patients", response_model=List[Dict[str, Any]])
def get_patients(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    patients = db.query(models.PatientProfile, models.User).join(models.User, models.PatientProfile.user_id == models.User.id).all()
    
    result = []
    for pat, user in patients:
        # Count appointments
        appt_count = db.query(models.Appointment).filter(models.Appointment.patient_id == pat.id).count()
        
        # Mock some urgent cases (e.g. patients with IDs 7, 8, or those with 0 appointments for testing)
        status = "URGENT" if pat.id in [7, 8] else "STABLE"
        
        result.append({
            "id": pat.id,
            "name": user.name,
            "email": user.email,
            "joined": user.created_at.strftime("%Y-%m-%d"),
            "appointments": appt_count,
            "lastActive": "Just now",
            "status": status
        })
    return result

@router.get("/patient/{patient_id}")
def get_patient_details(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    patient = db.query(models.PatientProfile, models.User).join(models.User, models.PatientProfile.user_id == models.User.id).filter(models.PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    pat, user = patient
    return {
        "id": pat.id,
        "name": user.name,
        "email": user.email,
        "age": pat.age,
        "gender": pat.gender,
        "blood_group": pat.blood_group,
        "medical_history": pat.medical_history,
        "phone": pat.phone,
        "address": pat.address,
        "joined": user.created_at.strftime("%b %d, %Y")
    }

@router.get("/patient/{patient_id}/timeline")
def get_patient_timeline(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    from sqlalchemy import desc
    appointments = db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id).order_by(desc(models.Appointment.appointment_datetime)).all()
    
    timeline = []
    for appt in appointments:
        doctor = db.query(models.DoctorProfile, models.User).join(models.User, models.DoctorProfile.user_id == models.User.id).filter(models.DoctorProfile.id == appt.doctor_id).first()
        doc_name = doctor[1].name if doctor else "Unknown Doctor"
        
        timeline.append({
            "id": f"appt_{appt.id}",
            "type": "APPOINTMENT",
            "title": f"Consultation with {doc_name}",
            "date": appt.appointment_datetime.strftime("%Y-%m-%d %H:%M"),
            "status": appt.status,
            "details": f"Source: {appt.booking_source}"
        })
        
    return timeline

@router.post("/escalate")
def trigger_escalation(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    # Find all doctors and admins to notify
    recipients = db.query(models.User).filter(
        models.User.role.in_([models.UserRole.DOCTOR, models.UserRole.ADMIN])
    ).all()
    
    for recipient in recipients:
        base_link = "/admin/patients" if recipient.role == models.UserRole.ADMIN else "/doctor/patients"
        link = f"{base_link}?filter=urgent"
        role_title = "Admin" if current_user.role == models.UserRole.ADMIN else "Doctor"
        notification_service.create_notification(
            db=db,
            user_id=recipient.id,
            title="⚠️ URGENT ESCALATION PROTOCOL ⚠️",
            message=f"{role_title} {current_user.name} has triggered an escalation protocol for 3 urgent anomalies. Please review the live demographics immediately.",
            notification_type="SYSTEM_ALERT",
            link=link
        )
    
    return {"message": f"Escalation broadcasted to {len(recipients)} specialists."}
