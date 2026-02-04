"""
Custom Exception Classes

Consistent error handling across the application.
Each exception maps to a specific HTTP status code.
"""

from typing import Optional, Dict, Any


class POSException(Exception):
    """
    Base exception for all POS system errors.
    
    Attributes:
        message: Human-readable error message
        code: Machine-readable error code (e.g., "PAYMENT_FAILED")
        status_code: HTTP status code to return
        details: Additional error details (optional)
    """
    
    def __init__(
        self,
        message: str,
        code: str = "POS_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to API response format."""
        response = {
            "status": "error",
            "message": self.message,
            "code": self.code,
        }
        if self.details:
            response["details"] = self.details
        return response


class PaymentError(POSException):
    """Payment processing failed."""
    
    def __init__(
        self,
        message: str = "Payment processing failed",
        code: str = "PAYMENT_FAILED",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=400,
            details=details,
        )


class ValidationError(POSException):
    """Input validation failed."""
    
    def __init__(
        self,
        message: str = "Validation failed",
        code: str = "VALIDATION_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=400,
            details=details,
        )


class NotFoundError(POSException):
    """Resource not found."""
    
    def __init__(
        self,
        message: str = "Resource not found",
        code: str = "NOT_FOUND",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=404,
            details=details,
        )


class AuthenticationError(POSException):
    """Authentication failed."""
    
    def __init__(
        self,
        message: str = "Authentication required",
        code: str = "AUTH_REQUIRED",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=401,
            details=details,
        )


class StripeError(POSException):
    """Stripe API error."""
    
    def __init__(
        self,
        message: str = "Payment service error",
        code: str = "STRIPE_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=502,  # Bad Gateway - external service failed
            details=details,
        )


class SMSError(POSException):
    """SMS sending failed."""
    
    def __init__(
        self,
        message: str = "Failed to send SMS",
        code: str = "SMS_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=502,
            details=details,
        )
