import bcrypt
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set paths
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(''), 'backend')))

from app.db.database import DATABASE_URL
from app.models.models import User

def verify_user_pw(email, password):
    # Ensure URL is absolute for SQLite
    if DATABASE_URL.startswith("sqlite"):
        db_file = DATABASE_URL.split("///")[-1].replace("./", "")
        db_path = os.path.join(os.getcwd(), 'backend', db_file)
        full_url = f"sqlite:///{db_path}"
    else:
        full_url = DATABASE_URL
    
    engine = create_engine(full_url)
    SessionLimit = sessionmaker(bind=engine)
    db = SessionLimit()
    
    user = db.query(User).filter(User.email == email).first()
    if user:
        match = bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))
        print(f"User: {email}, Role: {user.role}, Password Match: {match}")
    else:
        print(f"User {email} not found!")
    db.close()

if __name__ == "__main__":
    verify_user_pw("vinith2004@gmail.com", "vinith123")
    verify_user_pw("admin@healthai.com", "admin123")
