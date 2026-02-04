"""
Transaction Schemas

Request/response models for transaction endpoints.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    """Base transaction fields."""
    
    amount: int = Field(
        ...,
        gt=0,
        description="Amount in smallest currency unit (cents)",
        examples=[1000]  # $10.00
    )
    currency: str = Field(
        default="USD",
        pattern=r"^[A-Z]{3}$",
        description="ISO 4217 currency code",
        examples=["USD", "KES", "EUR"]
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Transaction description"
    )


class TransactionCreate(TransactionBase):
    """Request to create a new transaction."""
    
    customer_email: Optional[str] = Field(
        default=None,
        pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$",
        description="Customer email"
    )
    customer_phone: Optional[str] = Field(
        default=None,
        pattern=r"^\+?[\d\s-]{10,15}$",
        description="Customer phone number"
    )
    payment_method: str = Field(
        default="card",
        description="Payment method type",
        examples=["card", "terminal", "payment_link"]
    )


class TransactionResponse(BaseModel):
    """Transaction in API responses."""
    
    id: int
    stripe_payment_intent_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    payment_method: Optional[str] = None
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Computed fields
    amount_display: Optional[str] = None
    
    model_config = {"from_attributes": True}


class TransactionList(BaseModel):
    """List of transactions with pagination."""
    
    status: str = "success"
    data: List[TransactionResponse]
    pagination: dict


class TransactionStats(BaseModel):
    """Transaction statistics."""
    
    total_count: int
    total_amount: Decimal
    successful_count: int
    failed_count: int
    pending_count: int
