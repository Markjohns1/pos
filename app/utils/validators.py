"""
Input Validation Helpers

Reusable validation functions for common patterns.
"""

import re
from typing import Optional


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format.
    
    Accepts formats:
    - +254712345678
    - 0712345678
    - 712345678
    """
    # Remove spaces and dashes
    phone = phone.replace(" ", "").replace("-", "")
    
    # Check pattern
    pattern = r"^\+?[\d]{10,15}$"
    return bool(re.match(pattern, phone))


def validate_email(email: str) -> bool:
    """
    Validate email format.
    """
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email))


def validate_currency(currency: str) -> bool:
    """
    Validate ISO 4217 currency code.
    """
    allowed = ["USD", "KES", "EUR", "GBP"]
    return currency.upper() in allowed


def sanitize_string(value: str, max_length: int = 500) -> str:
    """
    Sanitize string input.
    
    - Strips whitespace
    - Truncates to max length
    - Removes control characters
    """
    if not value:
        return ""
    
    # Strip whitespace
    value = value.strip()
    
    # Remove control characters (keep newlines and tabs)
    value = "".join(
        char for char in value
        if char.isprintable() or char in "\n\t"
    )
    
    # Truncate
    return value[:max_length]


def format_phone_number(phone: str, country_code: str = "254") -> str:
    """
    Format phone number to international format.
    
    Examples:
    - 0712345678 -> +254712345678
    - 712345678 -> +254712345678
    - +254712345678 -> +254712345678
    """
    # Remove non-digits except +
    phone = re.sub(r"[^\d+]", "", phone)
    
    # Already has country code
    if phone.startswith("+"):
        return phone
    
    # Remove leading zero
    if phone.startswith("0"):
        phone = phone[1:]
    
    # Remove country code if present without +
    if phone.startswith(country_code):
        phone = phone[len(country_code):]
    
    return f"+{country_code}{phone}"
