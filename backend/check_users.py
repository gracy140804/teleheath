from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())
from app.db.database import DATABASE_URL
from app.models import models

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

users = db.query(models.User).all()
print(f"Total Users: {len(users)}")
for u in users:
    print(f"User: {u.email}, Role: {u.role}")

db.close()
