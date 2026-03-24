from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())
from app.db.database import DATABASE_URL
from app.models import models
from app.core import auth

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

target_email = "gracysahayam@gmail.com"
new_password = "password123"

user = db.query(models.User).filter(models.User.email == target_email).first()

if user:
    user.password_hash = auth.get_password_hash(new_password)
    db.commit()
    print(f"PASSWORD UPDATED FOR: {target_email} -> {new_password}")
else:
    # Create the user if doesn't exist
    password_hash = auth.get_password_hash(new_password)
    new_user = models.User(
        name="Admin User",
        email=target_email,
        password_hash=password_hash,
        role=models.UserRole.ADMIN
    )
    db.add(new_user)
    db.commit()
    print(f"USER CREATED AND PASSWORD SET: {target_email} -> {new_password}")

# List some common accounts
print("\n--- Current Available Accounts ---")
users = db.query(models.User).limit(10).all()
for u in users:
    print(f"Email: {u.email:<30} Role: {u.role}")

db.close()
