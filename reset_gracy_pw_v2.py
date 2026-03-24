import bcrypt
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Identify paths correctly
cwd = os.getcwd()
backend_path = os.path.join(cwd, 'backend')
if not os.path.exists(os.path.join(backend_path, 'app')):
    backend_path = cwd

sys.path.append(backend_path)

from app.db.database import DATABASE_URL
from app.models.models import User

def reset_password(email, new_password):
    # Ensure URL is absolute for SQLite
    if DATABASE_URL.startswith("sqlite"):
        db_file = DATABASE_URL.split("///")[-1].replace("./", "")
        db_path = os.path.join(backend_path, db_file)
        full_url = f"sqlite:///{db_path}"
    else:
        full_url = DATABASE_URL
    
    engine = create_engine(full_url)
    SessionLimit = sessionmaker(bind=engine)
    db = SessionLimit()
    
    user = db.query(User).filter(User.email == email).first()
    if user:
        new_hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user.password_hash = new_hashed
        db.commit()
        print(f"Successfully reset password for {email} to {new_password}. Role: {user.role}")
    else:
        print(f"User {email} not found!")
    db.close()

if __name__ == "__main__":
    reset_password("gracysahayam@gmail.com", "gracy123")
