"""
Payment Schemas

Request/response models for payment processing.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator


# Supported currencies
ALLOWED_CURRENCIES = ["USD", "KES", "EUR", "GBP"]


class PaymentRequest(BaseModel):
    """
    Request to process a payment.
    
    Amount should be in smallest currency unit (cents).
    """
    
    amount: int = Field(
        ...,
        gt=0,
        le=99999999,  # Max ~$999,999.99
        description="Amount in cents",
        examples=[1000, 5000, 10000]
    )
    currency: str = Field(
        default="USD",
        description="ISO 4217 currency code"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
    )
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    
    # Idempotency key to prevent duplicate charges
    idempotency_key: Optional[str] = Field(
        default=None,
        description="Unique key to prevent duplicate payments"
    )
    
    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Validate currency is supported."""
        v = v.upper()
        if v not in ALLOWED_CURRENCIES:
            raise ValueError(f"Currency must be one of: {ALLOWED_CURRENCIES}")
        return v


class PaymentResponse(BaseModel):
    """Response after creating a payment."""
    
    status: str = "success"
    payment_intent_id: str
    client_secret: str
    amount: int
    currency: str
    transaction_id: int


class PaymentLinkRequest(BaseModel):
    """
    Request to create a payment link.
    
    Link will be sent to customer via SMS.
    """
    
    amount: int = Field(
        ...,
        gt=0,
        le=99999999,
        description="Amount in cents"
    )
    currency: str = Field(default="USD")
    customer_phone: str = Field(
        ...,
        pattern=r"^\+?[\d\s-]{10,15}$",
        description="Phone number with country code",
        examples=["+254712345678", "+1234567890"]
    )
    customer_name: Optional[str] = Field(
        default=None,
        max_length=100
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500
    )
    send_sms: bool = Field(
        default=True,
        description="Whether to send payment link via SMS"
    )
    
    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        v = v.upper()
        if v not in ALLOWED_CURRENCIES:
            raise ValueError(f"Currency must be one of: {ALLOWED_CURRENCIES}")
        return v


class PaymentLinkResponse(BaseModel):
    """Response after creating a payment link."""
    
    status: str = "success"
    link_id: int
    url: str
    amount: int
    currency: str
    customer_phone: str
    sms_sent: bool
    expires_at: Optional[str] = None


class RefundRequest(BaseModel):
    """Request to refund a payment."""
    
    transaction_id: int = Field(..., description="Transaction to refund")
    amount: Optional[int] = Field(
        default=None,
        gt=0,
        description="Partial refund amount in cents. Full refund if not specified."
    )
    reason: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Reason for refund"
    )


class RefundResponse(BaseModel):
    """Response after processing a refund."""
    
    status: str = "success"
    refund_id: str
    amount: int
    currency: str
    transaction_id: int
