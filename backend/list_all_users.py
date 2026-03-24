from app.db.database import SessionLocal
from app.models.models import User
import sys
import os

db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"User: {u.email}, Role: {u.role}")
db.close()
