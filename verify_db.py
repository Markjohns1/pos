from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.utils.security import verify_password

engine = create_engine("sqlite:///./pos.db")
Session = sessionmaker(bind=engine)
session = Session()

user = session.query(User).filter(User.username == "posboss").first()
if user:
    print(f"User found: {user.username}")
    print(f"Hashed password: {user.hashed_password}")
    
    # Try verifying with the password
    is_valid = verify_password("interpos2004!", user.hashed_password)
    print(f"Password verification successful: {is_valid}")
else:
    print("User NOT found")
