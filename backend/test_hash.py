from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
try:
    h = pwd_context.hash("Doctor@123")
    print(f"Success: {h}")
except Exception as e:
    print(f"Error: {e}")
