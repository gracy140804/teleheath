from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
import os
import shutil
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from ..api import deps
from typing import List, Dict, Any
from datetime import datetime
import uuid
from ..services.notification_service import notification_service

router = APIRouter(prefix="/doctor", tags=["doctor"])

@router.get("/stats")
def get_doctor_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    today = datetime.now().date()
    
    # 1. Today's Appointments
    today_appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_profile.id,
        models.Appointment.appointment_datetime >= datetime.combine(today, datetime.min.time()),
        models.Appointment.appointment_datetime <= datetime.combine(today, datetime.max.time())
    ).count()

    # 2. Pending Requests
    pending_requests = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_profile.id,
        models.Appointment.status == models.AppointmentStatus.PENDING
    ).count()

    # 3. Total Unique Patients
    total_patients = db.query(models.Appointment.patient_id).filter(
        models.Appointment.doctor_id == doctor_profile.id
    ).distinct().count()

    return {
        "today_appointments": today_appointments,
        "pending_requests": pending_requests,
        "total_patients": total_patients
    }

@router.get("/appointments", response_model=List[Dict[str, Any]])
def get_doctor_appointments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    appointments = (
        db.query(models.Appointment, models.User)
        .outerjoin(models.PatientProfile, models.Appointment.patient_id == models.PatientProfile.id)
        .outerjoin(models.User, models.PatientProfile.user_id == models.User.id)
        .filter(models.Appointment.doctor_id == doctor_profile.id)
        .order_by(models.Appointment.appointment_datetime.desc())
        .all()
    )
    
    result = []
    for appt, patient_user in appointments:
        result.append({
            "id": appt.id,
            "patient_id": appt.patient_id,
            "patient_name": patient_user.name,
            "appointment_datetime": appt.appointment_datetime.isoformat(),
            "status": appt.status,
            "payment_status": appt.payment_status,
            "has_prescription": len(appt.prescriptions) > 0,
            "prescription_url": appt.prescriptions[0].file_url if len(appt.prescriptions) > 0 else None,
            "booking_source": appt.booking_source,
            "rescheduled_datetime": appt.rescheduled_datetime.isoformat() if appt.rescheduled_datetime else None,
            "video_room_id": appt.video_room_id
        })
        
    return result

@router.post("/appointment/{appointment_id}/accept")
def accept_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appointment.status = models.AppointmentStatus.CONFIRMED
    if not appointment.video_room_id:
        appointment.video_room_id = str(uuid.uuid4())
        
    db.commit()

    # Notify patient
    notification_service.create_notification(
        db=db,
        user_id=appointment.patient.user_id,
        title="Appointment Accepted",
        message=f"Dr. {current_user.name} has accepted your appointment request for {appointment.appointment_datetime.strftime('%Y-%m-%d %H:%M')}.",
        notification_type="STATUS_CHANGE",
        link="/patient/dashboard"
    )

    return {"status": "success", "video_room_id": appointment.video_room_id}

@router.post("/appointment/{appointment_id}/reject")
def reject_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appointment.status = models.AppointmentStatus.REJECTED
    db.commit()

    # Notify patient
    notification_service.create_notification(
        db=db,
        user_id=appointment.patient.user_id,
        title="Appointment Rejected",
        message=f"Dr. {current_user.name} has rejected your appointment request for {appointment.appointment_datetime.strftime('%Y-%m-%d %H:%M')}.",
        notification_type="STATUS_CHANGE",
        link="/patient/dashboard"
    )

    return {"status": "success"}

@router.post("/appointment/{appointment_id}/reschedule")
def suggest_reschedule(
    appointment_id: int,
    new_datetime: datetime,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appointment.rescheduled_datetime = new_datetime
    appointment.status = models.AppointmentStatus.RESCHEDULE_REQUESTED
    db.commit()

    # Notify patient
    notification_service.create_notification(
        db=db,
        user_id=appointment.patient.user_id,
        title="Reschedule Requested",
        message=f"Dr. {current_user.name} has requested to reschedule your appointment to {new_datetime.strftime('%Y-%m-%d %H:%M')}.",
        notification_type="STATUS_CHANGE",
        link="/patient/dashboard"
    )

    return {"status": "success"}

@router.get("/appointment/{appointment_id}/patient-profile")
def get_appointment_patient_profile(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Access restricted to medical professionals.")
        
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    patient = db.query(models.PatientProfile).filter(models.PatientProfile.id == appointment.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    return {
        "id": patient.id,
        "name": patient.user.full_name if patient.user else "Unknown Patient",
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "weight": patient.weight,
        "phone": patient.user.phone if patient.user else None,
        "medical_history": patient.medical_history
    }

@router.post("/appointment/{appointment_id}/upload-prescription")
async def upload_prescription(
    appointment_id: int,
    file: UploadFile = File(...),
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    doctor_profile = current_user.doctor_profile
    if not doctor_profile or appointment.doctor_id != doctor_profile.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Save file
    upload_dir = "uploads/prescriptions"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    file_path = f"{upload_dir}/{appointment_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create prescription record
    prescription = models.Prescription(
        appointment_id=appointment_id,
        file_url=f"/{file_path}", 
        notes=notes or f"Prescription uploaded by Dr. {current_user.name}"
    )
    db.add(prescription)
    
    # Finally, mark appointment as COMPLETED
    appointment.status = models.AppointmentStatus.COMPLETED
    
    db.commit()
    return {"status": "success", "file_url": prescription.file_url}

# Profile Management
@router.get("/profile", response_model=schemas.DoctorProfileResponse)
def get_doctor_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    # Let's attach the name from current_user to match schema
    profile_data = {
        "id": doctor_profile.id,
        "user_id": doctor_profile.user_id,
        "name": current_user.name,
        "specialization": doctor_profile.specialization,
        "qualification": doctor_profile.qualification,
        "experience": doctor_profile.experience,
        "consultation_fee": doctor_profile.consultation_fee,
        "rating": doctor_profile.rating,
        "is_approved": doctor_profile.is_approved,
        "availability_schedule": doctor_profile.availability_schedule
    }
    return profile_data

@router.put("/profile", response_model=schemas.DoctorProfileResponse)
def update_doctor_profile(
    profile_update: schemas.DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        # Create one if missing? For robustness, let's create it.
        doctor_profile = models.DoctorProfile(user_id=current_user.id)
        db.add(doctor_profile)

    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doctor_profile, key, value)
    
    # Auto-approve doctors for testing purposes since no admin portal
    doctor_profile.is_approved = True
    
    db.commit()
    db.refresh(doctor_profile)
    db.refresh(current_user)

    profile_data = {
        "id": doctor_profile.id,
        "user_id": doctor_profile.user_id,
        "name": current_user.name,
        "specialization": doctor_profile.specialization,
        "qualification": doctor_profile.qualification,
        "experience": doctor_profile.experience,
        "consultation_fee": doctor_profile.consultation_fee,
        "rating": doctor_profile.rating,
        "is_approved": doctor_profile.is_approved,
        "availability_schedule": doctor_profile.availability_schedule
    }
    return profile_data

# Availability Management
@router.get("/availability", response_model=List[schemas.DoctorAvailabilityResponse])
def get_doctor_availability(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
        
    slots = db.query(models.DoctorAvailability).filter(
        models.DoctorAvailability.doctor_id == doctor_profile.id,
        models.DoctorAvailability.is_active == True
    ).order_by(models.DoctorAvailability.date, models.DoctorAvailability.start_time).all()
    
    return slots

@router.post("/availability", response_model=schemas.DoctorAvailabilityResponse)
def create_doctor_availability(
    slot: schemas.DoctorAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    new_slot = models.DoctorAvailability(
        doctor_id=doctor_profile.id,
        date=slot.date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        slot_duration=slot.slot_duration,
        is_active=True
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    
    return new_slot

@router.delete("/availability/{slot_id}")
def delete_doctor_availability(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.DOCTOR]))
):
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    slot = db.query(models.DoctorAvailability).filter(
        models.DoctorAvailability.id == slot_id,
        models.DoctorAvailability.doctor_id == doctor_profile.id
    ).first()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Availability slot not found or unauthorized")
        
    db.delete(slot)
    db.commit()
    
    return {"status": "success", "message": "Slot deleted"}
