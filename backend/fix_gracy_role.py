from app.db.database import SessionLocal
from app.models.models import User, UserRole
import sys
import os

db = SessionLocal()
email = 'gracysahayam@gmail.com'
u = db.query(User).filter(User.email == email).first()
if u:
    u.role = UserRole.PATIENT
    db.commit()
    print(f'User {email} updated to {u.role}')
else:
    print(f'User {email} not found')
db.close()
