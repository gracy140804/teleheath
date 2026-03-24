import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import re

# Identify paths correctly
cwd = os.getcwd()
backend_path = os.path.join(cwd, 'backend')
if not os.path.exists(os.path.join(backend_path, 'app')):
    backend_path = cwd

sys.path.append(backend_path)

from app.db.database import DATABASE_URL
from app.models.models import User, UserRole

def remove_numbering():
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
    
    # Target specifically DOCTOR roles or anyone with the pattern
    users = db.query(User).filter(User.name.like("% (%")).all()
    count = 0
    for u in users:
        new_name = re.sub(r'\s*\(\d+\)$', '', u.name)
        if new_name != u.name:
            print(f"Renaming: {u.name} -> {new_name}")
            u.name = new_name
            count += 1
    
    db.commit()
    print(f"Update complete! Total updated: {count}")
    db.close()

if __name__ == "__main__":
    remove_numbering()
