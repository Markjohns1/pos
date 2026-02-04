"""
Security Helpers

Utility functions for security-related operations.
"""

import secrets
import hashlib
from typing import Optional

from passlib.context import CryptContext


# Password hashing context
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Use this when storing user passwords.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def generate_token(length: int = 32) -> str:
    """
    Generate a secure random token.
    
    Use for:
    - API keys
    - Session tokens
    - Password reset tokens
    """
    return secrets.token_urlsafe(length)


def generate_idempotency_key() -> str:
    """
    Generate an idempotency key for Stripe API calls.
    
    Use this when you need to ensure a payment isn't processed twice.
    """
    return secrets.token_hex(16)


def hash_api_key(api_key: str) -> str:
    """
    Create a hash of an API key for storage.
    
    Store the hash, not the plaintext key.
    """
    return hashlib.sha256(api_key.encode()).hexdigest()


def constant_time_compare(val1: str, val2: str) -> bool:
    """
    Compare two strings in constant time.
    
    Use this to prevent timing attacks when comparing secrets.
    """
    return secrets.compare_digest(val1, val2)
