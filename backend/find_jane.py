from app.db.database import SessionLocal
from app.models.models import User
import sys
import os

db = SessionLocal()
u = db.query(User).filter(User.email == "jane@example.com").first()
if u:
    print(f"Found user: {u.email}, role: {u.role}")
else:
    print("User jane@example.com not found")
db.close()
