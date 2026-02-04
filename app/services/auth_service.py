"""
Auth Service

Handles user authentication, password hashing, and JWT generation.
"""

from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.schemas.auth import UserRegister, TokenData
from app.utils.security import hash_password, verify_password
from app.utils import logger, AuthenticationError


class AuthService:
    """
    Service for authentication and security operations.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, username: str, password: str) -> User:
        """
        Verify user credentials.
        """
        user = self.db.query(User).filter(User.username == username).first()
        
        if not user:
            logger.warning("Auth failed: User not found", username=username)
            raise AuthenticationError("Invalid username or password")
            
        if not verify_password(password, user.hashed_password):
            logger.warning("Auth failed: Invalid password", username=username)
            raise AuthenticationError("Invalid username or password")
            
        return user
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Generate a JWT access token.
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
            
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.jwt_secret_key, 
            algorithm=settings.jwt_algorithm
        )
        
        return encoded_jwt
    
    def register_user(self, user_data: UserRegister) -> User:
        """
        Create a new admin user.
        """
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            raise AuthenticationError("Username or email already registered")
            
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
        )
        
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        
        logger.info("New admin registered", username=new_user.username)
        return new_user
