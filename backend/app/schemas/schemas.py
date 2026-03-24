from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from ..models.models import UserRole, AppointmentStatus

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.PATIENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

# Profile schemas
class PatientProfileBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    blood_group: Optional[str] = None
    weight: Optional[str] = None

class PatientProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None
    avatar_url: Optional[str] = None
    blood_group: Optional[str] = None
    weight: Optional[str] = None

class PatientProfileResponse(PatientProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class DoctorProfileBase(BaseModel):
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    rating: Optional[float] = 0.0
    is_approved: Optional[bool] = False
    availability_schedule: Optional[Any] = None

class DoctorProfileUpdate(BaseModel):
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    availability_schedule: Optional[Any] = None

class DoctorProfileResponse(DoctorProfileBase):
    id: int
    user_id: int
    name: str # From user
    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentBase(BaseModel):
    doctor_id: int
    appointment_datetime: datetime
    booking_source: Optional[str] = "AI"
    rescheduled_datetime: Optional[datetime] = None

class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    status: AppointmentStatus
    payment_status: str
    booking_source: str
    rescheduled_datetime: Optional[datetime] = None
    video_room_id: Optional[str] = None
    class Config:
        from_attributes = True

# Symptom Record schemas
class SymptomRecordBase(BaseModel):
    raw_text: str
    recorded_language: Optional[str] = "Auto Detect"

class SymptomRecordResponse(SymptomRecordBase):
    id: int
    patient_id: int
    original_speech_text: Optional[str] = None
    detected_language: Optional[str] = None
    translated_text: Optional[str] = None
    extracted_data: Any
    created_at: datetime
    class Config:
        from_attributes = True

class DoctorAvailabilityBase(BaseModel):
    date: datetime
    start_time: str
    end_time: str
    slot_duration: int = 30
    is_active: bool = True

class DoctorAvailabilityCreate(BaseModel):
    date: datetime
    start_time: str
    end_time: str
    slot_duration: Optional[int] = 30

class DoctorAvailabilityResponse(DoctorAvailabilityBase):
    id: int
    doctor_id: int
    class Config:
        from_attributes = True

# Lab schemas
class LabTestBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float
    test_code: str

class LabTestResponse(LabTestBase):
    id: int
    class Config:
        from_attributes = True

class LabAppointmentBase(BaseModel):
    test_id: int
    appointment_datetime: datetime
    provider_name: str
    notes: Optional[str] = None

class LabAppointmentResponse(LabAppointmentBase):
    id: int
    patient_id: int
    status: AppointmentStatus
    test: Optional[LabTestResponse] = None
    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool = False

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True
