from app.db.database import SessionLocal
from app.models.models import User
import sys
import os

db = SessionLocal()
email = 'gracysahayam@gmail.com'
u = db.query(User).filter(User.email == email).first()
if u:
    print(f"ROLE_FOR_{email}: {u.role}")
else:
    print(f"User {email} not found")
db.close()
