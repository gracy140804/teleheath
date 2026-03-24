from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db.database import Base

class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    RESCHEDULE_REQUESTED = "RESCHEDULE_REQUESTED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PATIENT)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)

class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    age = Column(Integer)
    gender = Column(String(50))
    phone = Column(String(20))
    address = Column(String(255))
    medical_history = Column(Text)
    blood_group = Column(String(10))
    weight = Column(String(10))

    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")
    symptom_records = relationship("SymptomRecord", back_populates="patient")

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    specialization = Column(String(255))
    qualification = Column(String(255), nullable=True)
    experience = Column(Integer)
    consultation_fee = Column(Float)
    rating = Column(Float, default=0.0)
    is_approved = Column(Boolean, default=False)
    availability_schedule = Column(JSON, nullable=True) # JSON of available slots

    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    availabilities = relationship("DoctorAvailability", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"))
    appointment_datetime = Column(DateTime)
    rescheduled_datetime = Column(DateTime, nullable=True) # Suggested by doctor
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    payment_status = Column(String(50), default="UNPAID")
    booking_source = Column(String(50), default="AI") # e.g., "AI" or "MANUAL"
    video_room_id = Column(String(100), nullable=True)
    
    patient = relationship("PatientProfile", back_populates="appointments")
    doctor = relationship("DoctorProfile", back_populates="appointments")
    prescriptions = relationship("Prescription", back_populates="appointment")

class SymptomRecord(Base):
    __tablename__ = "symptom_records"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    raw_text = Column(Text)
    original_speech_text = Column(Text, nullable=True)
    detected_language = Column(String(50), nullable=True)
    translated_text = Column(Text, nullable=True)
    extracted_data = Column(JSON)
    analysed_specialization = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("PatientProfile", back_populates="symptom_records")

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    file_url = Column(String(500))
    notes = Column(Text)

    appointment = relationship("Appointment", back_populates="prescriptions")

class DoctorAvailability(Base):
    __tablename__ = "doctor_availabilities"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"))
    date = Column(DateTime) # Store as date but using DateTime for ease
    start_time = Column(String(10)) # e.g., "09:00"
    end_time = Column(String(10)) # e.g., "17:00"
    slot_duration = Column(Integer, default=30) # in minutes
    is_active = Column(Boolean, default=True)

    doctor = relationship("DoctorProfile", back_populates="availabilities")

class LabTest(Base):
    __tablename__ = "lab_tests"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    price = Column(Float)
    test_code = Column(String(50), unique=True)

class LabAppointment(Base):
    __tablename__ = "lab_appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    test_id = Column(Integer, ForeignKey("lab_tests.id"))
    appointment_datetime = Column(DateTime)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    provider_name = Column(String(255))
    notes = Column(Text, nullable=True)

    patient = relationship("PatientProfile")
    test = relationship("LabTest")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    type = Column(String(50)) # "STATUS_CHANGE", "CONSULTATION_START"
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="notifications")
