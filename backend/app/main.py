from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from .api import auth, patient, doctor, admin, video, labs, notifications
from .db.database import engine, Base, SessionLocal
import asyncio
from datetime import datetime, timedelta
from .services.notification_service import notification_service
from .models import models

# Create tables for dev if using sqlite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Driven Smart Telehealth Platform",
    description="Telehealth platform with AI-powered symptom analysis and doctor recommendation.",
    version="1.0.0"
)

# CORS middleware
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "Range"],
    expose_headers=["Content-Length", "Accept-Ranges"],
)

# API routes
app.include_router(auth.router, prefix="/api")
app.include_router(patient.router, prefix="/api")
app.include_router(doctor.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(video.router, prefix="/api")
app.include_router(labs.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

# Background Task for Consultation Alerts
async def consultation_alert_task():
    while True:
        try:
            db = SessionLocal()
            now = datetime.now()
            # Check appointments starting in the next 5 minutes that haven't been alerted yet
            # We use a threshold to avoid missing appointments due to timing
            upcoming_appointments = db.query(models.Appointment).filter(
                models.Appointment.status == models.AppointmentStatus.CONFIRMED,
                models.Appointment.appointment_datetime >= now,
                models.Appointment.appointment_datetime <= now + timedelta(minutes=5)
            ).all()

            for appt in upcoming_appointments:
                # Check if notification already exists to avoid duplicates
                existing_notif = db.query(models.Notification).filter(
                    models.Notification.type == "CONSULTATION_START",
                    models.Notification.message.like(f"%{appt.id}%")
                ).first()

                if not existing_notif:
                    # Notify Patient
                    notification_service.create_notification(
                        db=db,
                        user_id=appt.patient.user_id,
                        title="Consultation Starting Soon",
                        message=f"Your consultation with Dr. {appt.doctor.user.name} is starting in less than 5 minutes. (Ref: {appt.id})",
                        notification_type="CONSULTATION_START",
                        link=f"/patient/video-call/{appt.id}" # using appt.id because [appointmentId] expects ID
                    )
                    # Notify Doctor
                    notification_service.create_notification(
                        db=db,
                        user_id=appt.doctor.user_id,
                        title="Consultation Starting Soon",
                        message=f"Your consultation with {appt.patient.user.name} is starting in less than 5 minutes. (Ref: {appt.id})",
                        notification_type="CONSULTATION_START",
                        link=f"/doctor/video-call/{appt.id}" # Doctor needs to go to video-call too, not just appointments list
                    )
            db.close()
        except Exception as e:
            print(f"Error in consultation_alert_task: {e}")
        
        await asyncio.sleep(60) # Run every minute

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consultation_alert_task())

# Serve uploaded files
# ... (rest of the file unchanged) ...

# Serve uploaded files
import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Telehealth API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
