"""
Auth Routes

Endpoints for login and authentication.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import UserLogin, UserRegister, Token, UserResponse
from app.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate user and return JWT token.
    """
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(
        login_data.username, 
        login_data.password
    )
    
    access_token = auth_service.create_access_token(
        data={"sub": user.username}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new admin user (intended for initial setup).
    """
    auth_service = AuthService(db)
    return auth_service.register_user(user_data)
