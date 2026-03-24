from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from ..api import deps
from ..services import ai_service
from typing import List, Dict, Any
import json

router = APIRouter(prefix="/patient", tags=["patient"])

@router.get("/profile", response_model=schemas.PatientProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=schemas.PatientProfileResponse)
def update_profile(
    profile_in: schemas.PatientProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Update User name if provided
    if profile_in.name:
        current_user.name = profile_in.name
    
    # Update Profile fields
    update_data = profile_in.dict(exclude_unset=True, exclude={"name"})
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    import os
    import shutil
    from datetime import datetime
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"avatar_{current_user.id}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user's avatar_url
    avatar_url = f"/uploads/{filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    
    return {"url": avatar_url}

@router.post("/submit-symptoms", response_model=schemas.SymptomRecordResponse)
async def submit_symptoms(
    symptoms: schemas.SymptomRecordBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    # 1. Ensure Patient Profile Exists (Auto-create if missing)
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # Process text with AI Engine (English Only)
    print(f'DEBUG: Start symptom processing...')
    try:
        processed_data = ai_service.process_symptoms(symptoms.raw_text, db=db)
    except Exception as e:
        print(f'DEBUG: AI FAILED: {str(e)}')
        raise HTTPException(status_code=500, detail=str(e))
    print(f'DEBUG: AI Finish.')
    
    # Store in database
    new_record = models.SymptomRecord(
        patient_id=profile.id,
        raw_text=symptoms.raw_text, # Standard UI text
        original_speech_text=symptoms.raw_text,
        detected_language="English",
        translated_text=None,
        extracted_data=processed_data
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    return new_record

@router.post("/process-voice")
async def process_voice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    # 1. Ensure Patient Profile Exists (Auto-create if missing)
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # High Accuracy Transcription via Backend AI Engine
    transcribed_text = ai_service.high_accuracy_stt(file)
    
    # Process text with AI Engine (English Only)
    processed_data = ai_service.process_symptoms(transcribed_text, db=db)
    
    # Store in database
    new_record = models.SymptomRecord(
        patient_id=profile.id,
        raw_text=transcribed_text,
        original_speech_text=transcribed_text,
        detected_language="English",
        translated_text=None,
        extracted_data=processed_data
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    return new_record

@router.get("/recommend-doctors")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    # 1. Ensure Patient Profile Exists (Auto-create if missing)
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # Fetch latest symptom record
    latest_record = db.query(models.SymptomRecord).filter(
        models.SymptomRecord.patient_id == profile.id
    ).order_by(models.SymptomRecord.created_at.desc()).first()
    
    if not latest_record:
        # Default context if no symptoms recorded yet - show General Physicians
        patient_context = {"symptoms": [], "severity": "Moderate", "recommended_spec": "General Physician"}
    else:
        patient_context = latest_record.extracted_data if latest_record.extracted_data else {}
        if not isinstance(patient_context, dict): 
            patient_context = {}
    
    # Check for emergency (Do NOT return early, continue to recommend specialists)
    emergency_alert = False
    if patient_context.get("is_emergency"):
        emergency_alert = True
    
    # Fetch approved doctors
    doctors = db.query(models.DoctorProfile).filter(models.DoctorProfile.is_approved == True).all()
    
    # Format for AI model
    doctor_list = []
    for doc in doctors:
        doctor_list.append({
            "id": doc.id,
            "name": doc.user.name,
            "specialization": doc.specialization,
            "rating": doc.rating,
            "experience": doc.experience,
            "consultation_fee": doc.consultation_fee,
            "is_approved": doc.is_approved
        })
    
    # Get intelligent recommendation scores (Passing DB session)
    # The service now always returns exactly 3 doctors.
    recommended_doctors = ai_service.recommend_doctors(patient_context, db=db)
    
    recommended_spec = patient_context.get("recommended_spec", "General Physician")
    
    # Enrich with 24/7 Availability Simulation
    from datetime import datetime, timedelta
    from ..models.models import DoctorAvailability
    
    enriched_recs = []
    for rec in recommended_doctors:
        doc_id = rec["doctor_id"]
        profile = rec["profile"]
        
        # Robust Date Check for Today's Slots
        now = datetime.now()
        today_date = now.date()
        
        real_slots = (
            db.query(DoctorAvailability)
            .filter(DoctorAvailability.doctor_id == doc_id)
            .filter(DoctorAvailability.is_active == True)
            .filter(DoctorAvailability.date >= today_date)
            .all()
        )
        
        slots = []
        if real_slots:
            from datetime import time as dt_time
            now_time = now.time()
            for s in real_slots:
                # Handle DateTime to Date conversion if necessary
                s_date = s.date.date() if hasattr(s.date, 'date') else s.date
                
                # If slot is today, check if start_time is in the future
                try:
                    slot_start = datetime.strptime(s.start_time, "%H:%M").time()
                except:
                    # Fallback for different formats
                    slot_start = dt_time(0,0)
                
                if s_date > today_date or (s_date == today_date and slot_start > now_time):
                    slots.append(f"{s_date.strftime('%Y-%m-%d')} {s.start_time}")
        
        if not slots:
            # 24/7 Guaranteed Availability Simulation for ALL Doctors
            s1 = now + timedelta(hours=1)
            s2 = now + timedelta(hours=2)
            s3 = now.replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)
            
            slots = [
                s1.strftime("%Y-%m-%d %H:00"),
                s2.strftime("%Y-%m-%d %H:00"),
                s3.strftime("%Y-%m-%d %H:00")
            ]
        
        profile["available_slots"] = slots[:5] # Show top 5 slots
        profile["next_available_slot"] = slots[0]
        enriched_recs.append(rec)

    response = {
        "detected_specialization": recommended_spec,
        "recommended_doctors": enriched_recs,
        "emergency_alert": emergency_alert,
        "detected_symptoms": patient_context.get("symptoms", []),
        "detected_severity": patient_context.get("severity", "Moderate"),
        "detected_duration": patient_context.get("duration", "Unknown")
    }
    
    return response

@router.get("/departments", response_model=List[Dict[str, Any]])
def get_departments():
    # Structured list of clinical departments
    departments = [
        {"name": "General Physician", "icon": "Stethoscope", "description": "General health checkups, flu, and common infections."},
        {"name": "Cardiologist", "icon": "Heart", "description": "Heart health, chest pain, and cardiovascular conditions."},
        {"name": "Dermatologist", "icon": "Sparkles", "description": "Skin conditions, rashes, acne, and hair health."},
        {"name": "Orthopedic", "icon": "Bone", "description": "Joint pains, bone fractures, and physical injuries."},
        {"name": "Neurologist", "icon": "Brain", "description": "Headaches, migraines, and nervous system disorders."},
        {"name": "Gastroenterologist", "icon": "Apple", "description": "Digestive issues, stomach pain, and acidity."},
        {"name": "Psychiatrist", "icon": "Smile", "description": "Mental health, anxiety, and depression support."},
        {"name": "ENT Specialist", "icon": "Ear", "description": "Ear, nose, and throat infections or issues."},
        {"name": "Ophthalmologist", "icon": "Eye", "description": "Eye checkups, vision issues, and cataracts."},
        {"name": "Endocrinologist", "icon": "Activity", "description": "Diabetes, thyroid, and hormonal imbalances."}
    ]
    return departments

@router.get("/departments/{dept_name}/doctors", response_model=List[Dict[str, Any]])
def get_specialists(dept_name: str, db: Session = Depends(get_db)):
    from ..models.models import DoctorAvailability
    from datetime import datetime, timedelta
    
    now = datetime.now()
    now_date = now.date()

    # 1. Fetch primary specialists and prioritize those with ACTIVE slots
    # Identify doctors who HAVE real future slots (Robust date check)
    # Using cast to date if possible or just fetching and filtering
    all_slots = db.query(DoctorAvailability).filter(DoctorAvailability.is_active == True).all()
    real_available_ids = []
    for s in all_slots:
        s_date = s.date.date() if hasattr(s.date, 'date') else s.date
        if s_date >= now_date:
            real_available_ids.append(s.doctor_id)

    all_primary = (
        db.query(models.DoctorProfile)
        .filter(models.DoctorProfile.specialization.ilike(dept_name))
        .filter(models.DoctorProfile.is_approved == True)
        .order_by(models.DoctorProfile.rating.desc())
        .all()
    )
    
    # Split into those with real slots vs those without
    available_primary = [d for d in all_primary if d.id in real_available_ids]
    others_primary = [d for d in all_primary if d.id not in real_available_ids]
    
    doctors = available_primary + others_primary # Re-assign to 'doctors' for the loop below
    
    final_list = []
    # Generate 24/7 common slots for simulation
    s1 = now + timedelta(hours=1)
    s2 = now + timedelta(hours=2)
    s3 = now.replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)
    
    fallback_slots = [
        s1.strftime("%Y-%m-%d %H:00"),
        s2.strftime("%Y-%m-%d %H:00"),
        s3.strftime("%Y-%m-%d %H:00")
    ]
    
    for doc in doctors:
        # Check for real slots
        real_slots = (
            db.query(DoctorAvailability)
            .filter(DoctorAvailability.doctor_id == doc.id)
            .filter(DoctorAvailability.is_active == True)
            .filter(DoctorAvailability.date >= now)
            .all()
        )
        
        slots = []
        if real_slots:
            for s in real_slots:
                slots.append(f"{s.date.strftime('%Y-%m-%d')} {s.start_time}")
        else:
            slots = fallback_slots
            
        final_list.append({
            "id": doc.id,
            "user_id": doc.user_id,
            "name": doc.user.name,
            "full_name": doc.user.name,
            "specialization": doc.specialization,
            "qualification": doc.qualification,
            "experience": doc.experience,
            "consultation_fee": doc.consultation_fee,
            "rating": doc.rating,
            "availability_status": "Available",
            "is_approved": doc.is_approved,
            "is_synthetic": False,
            "available_slots": slots,
            "next_available_slot": slots[0] if slots else None
        })
    
    return final_list

@router.post("/book-appointment", response_model=schemas.AppointmentResponse)
def book_appointment(
    appointment: schemas.AppointmentBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    # 1. Ensure Patient Profile Exists (Auto-create if missing)
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # 2. Handle Synthetic/On-Call Doctors (Bypass DB Save to avoid FK crash)
    if appointment.doctor_id >= 888000:
        # Return a simulated successful appointment response
        return schemas.AppointmentResponse(
            id=appointment.doctor_id + 1, # Mock ID
            patient_id=profile.id,
            doctor_id=appointment.doctor_id,
            appointment_datetime=appointment.appointment_datetime,
            status=models.AppointmentStatus.CONFIRMED, # Auto-confirm synthetic slots
            payment_status="UNPAID",
            booking_source=appointment.booking_source or "AI",
            patient_name=current_user.name
        )

    # 3. Prevent Overlapping/Double Booking
    # Check if patient already has an active appointment at this time
    existing_patient_appointment = db.query(models.Appointment).filter(
        models.Appointment.patient_id == profile.id,
        models.Appointment.appointment_datetime == appointment.appointment_datetime,
        models.Appointment.status.notin_([models.AppointmentStatus.CANCELLED, models.AppointmentStatus.REJECTED])
    ).first()
    
    if existing_patient_appointment:
        raise HTTPException(status_code=400, detail="You already have an appointment scheduled at this exact time.")

    # Check if doctor is already booked at this time (for regular doctors)
    existing_doctor_appointment = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == appointment.doctor_id,
        models.Appointment.appointment_datetime == appointment.appointment_datetime,
        models.Appointment.status.notin_([models.AppointmentStatus.CANCELLED, models.AppointmentStatus.REJECTED])
    ).first()
    
    if existing_doctor_appointment:
        raise HTTPException(status_code=400, detail="The doctor is already booked for this timeslot. Please select another time.")

    # 4. Regular Database Booking
    try:
        new_appointment = models.Appointment(
            patient_id=profile.id,
            doctor_id=appointment.doctor_id,
            appointment_datetime=appointment.appointment_datetime,
            status=models.AppointmentStatus.PENDING,
            payment_status="UNPAID",
            booking_source=appointment.booking_source or "AI"
        )
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)

        # Notify the doctor
        doctor_profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.id == appointment.doctor_id).first()
        if doctor_profile:
            from ..services.notification_service import notification_service
            notification_service.create_notification(
                db=db,
                user_id=doctor_profile.user_id,
                title="New Appointment Request",
                message=f"Patient {current_user.name} has requested an appointment for {appointment.appointment_datetime.strftime('%Y-%m-%d %H:%M')}.",
                notification_type="STATUS_CHANGE",
                link="/doctor/appointments"
            )

        return new_appointment
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error during booking: {str(e)}"
        )

@router.post("/appointment/{appointment_id}/respond-reschedule")
def respond_reschedule(
    appointment_id: int,
    action: str, # "ACCEPT", "DECLINE"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if action == "ACCEPT":
        appointment.appointment_datetime = appointment.rescheduled_datetime
        appointment.rescheduled_datetime = None
        appointment.status = models.AppointmentStatus.CONFIRMED
    else:
        # If declined, we might set to REJECTED or back to PENDING for re-booking
        appointment.status = models.AppointmentStatus.REJECTED
        
    db.commit()
    return {"status": "success", "new_status": appointment.status}

@router.post("/appointment/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id)
        .filter(models.Appointment.patient_id == current_user.patient_profile.id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appointment.status = models.AppointmentStatus.CANCELLED
    db.commit()
    return {"status": "success", "new_status": appointment.status}

@router.get("/appointments", response_model=List[Dict[str, Any]])
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    # Fetch appointments with doctor info and first prescription if exists
    appointments = (
        db.query(
            models.Appointment, 
            models.DoctorProfile, 
            models.User,
            models.Prescription.file_url
        )
        .join(models.DoctorProfile, models.Appointment.doctor_id == models.DoctorProfile.id)
        .join(models.User, models.DoctorProfile.user_id == models.User.id)
        .outerjoin(models.Prescription, models.Appointment.id == models.Prescription.appointment_id)
        .filter(models.Appointment.patient_id == current_user.patient_profile.id)
        .order_by(models.Appointment.appointment_datetime.desc())
        .all()
    )
    
    result = []
    # Use a dictionary to track unique appointments since outer join might return multiple rows if multiple prescriptions exist
    seen_appointments = set()
    
    for appt, doc, user, file_url in appointments:
        if appt.id in seen_appointments:
            continue
        seen_appointments.add(appt.id)
        
        result.append({
            "id": appt.id,
            "doctor_name": user.name,
            "specialization": doc.specialization,
            "appointment_datetime": appt.appointment_datetime.isoformat(),
            "status": appt.status.value if hasattr(appt.status, 'value') else appt.status,
            "payment_status": appt.payment_status,
            "video_room_id": appt.video_room_id,
            "prescription_url": file_url
        })
        
    return result

@router.get("/history", response_model=List[schemas.SymptomRecordResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    # Ensure Patient Profile Exists
    profile = current_user.patient_profile
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return db.query(models.SymptomRecord).filter(
        models.SymptomRecord.patient_id == profile.id
    ).order_by(models.SymptomRecord.created_at.desc()).all()

@router.get("/prescriptions", response_model=List[Dict[str, Any]])
def get_my_prescriptions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.check_role([models.UserRole.PATIENT, models.UserRole.ADMIN, models.UserRole.DOCTOR]))
):
    profile = current_user.patient_profile
    if not profile:
        return []
        
    prescriptions = (
        db.query(models.Prescription, models.Appointment, models.User)
        .join(models.Appointment, models.Prescription.appointment_id == models.Appointment.id)
        .join(models.DoctorProfile, models.Appointment.doctor_id == models.DoctorProfile.id)
        .join(models.User, models.DoctorProfile.user_id == models.User.id)
        .filter(models.Appointment.patient_id == profile.id)
        .order_by(models.Appointment.appointment_datetime.desc())
        .all()
    )
    
    result = []
    for pr, appt, doc_user in prescriptions:
        result.append({
            "id": pr.id,
            "appointment_id": appt.id,
            "doctor_name": doc_user.name,
            "date": appt.appointment_datetime.isoformat(),
            "file_url": pr.file_url,
            "notes": pr.notes
        })
        
    return result

@router.post("/chat")
async def patient_chat(
    request: Dict[str, str],
    db: Session = Depends(get_db)
):
    user_message = request.get("message", "").lower().strip()
    
    # Responsible AI logic (System Prompt equivalent)
    # 1. EMERGENCY CHECK (Priority)
    emergency_keywords = ["emergency", "chest pain", "bleeding", "unconscious", "stroke", "accident", "dying", "help me"]
    if any(k in user_message for k in emergency_keywords):
        return {"message": "IF THIS IS A MEDICAL EMERGENCY, CALL 108 IMMEDIATELY. Our doctors are ready once your condition is stabilized by emergency services."}
    
    # 2. KEYWORD MAPPING (Platform Intelligence)
    if "book" in user_message or "appointment" in user_message or "doctor" in user_message or "specialist" in user_message:
        return {"message": "You can browse and book specialists (Cardiology, Orthopedic, ENT, etc.) from the 'Doctors' tab. Most appointments can be scheduled within the hour!"}
    
    if "symptom" in user_message or "pain" in user_message or "feel" in user_message or "sick" in user_message:
        return {"message": "For a clinical analysis, please use our 'AI Symptom Checker'. It uses Med-BERT to recommend the right specialist based on your description."}
    
    if "report" in user_message or "record" in user_message or "prescription" in user_message or "history" in user_message:
        return {"message": "You can find your clinical records, lab reports, and prescriptions in the 'Health Records' section of your dashboard."}
        
    if "profile" in user_message or "setting" in user_message or "edit" in user_message:
        return {"message": "To update your contact details or profile picture, visit the 'My Profile' page."}

    if "hi" == user_message or "hello" == user_message or "hey" == user_message:
        return {"message": "Hello! I am AuraHealth's clinical AI. How can I assist you with your health journey today?"}

    # 3. GENERIC FALLBACK (Helpful/Supportive)
    return {"message": "I'm your 24/7 medical assistant. I can help with finding doctors, symptom analysis, or platform navigation. What's on your mind?"}
