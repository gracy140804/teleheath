from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from ..core import auth
from ..api import deps
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(deps.get_current_user)):
    return current_user

@router.post("/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    email_lower = user_in.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    
    password_hash = auth.get_password_hash(user_in.password)
    new_user = models.User(
        name=user_in.name,
        email=email_lower,
        password_hash=password_hash,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize profile based on role
    if user_in.role == models.UserRole.PATIENT:
        profile = models.PatientProfile(user_id=new_user.id)
        db.add(profile)
    elif user_in.role == models.UserRole.DOCTOR:
        profile = models.DoctorProfile(user_id=new_user.id)
        db.add(profile)
    
    db.commit()
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    email_lower = user_in.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    if not user:
        print(f"DEBUG: Login failed - User not found: {email_lower}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not auth.verify_password(user_in.password, user.password_hash):
        print(f"DEBUG: Login failed - Password mismatch for user: {email_lower}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role.value}, 
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id
    }

@router.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_lower = request.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    if not user:
        # We return success even if user not found for security (to prevent account enumeration)
        return {"message": "If an account exists, a reset link has been sent."}
    
    # In a real production app, generate a reset token, save to DB, and send real email
    print(f"DEBUG: Password reset requested for {request.email}. Sending simulated email...")
    
    return {"message": "Reset instructions sent to your email."}
