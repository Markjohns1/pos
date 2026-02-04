"""
Receipt Schemas

Request/response models for receipt generation.
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class ReceiptRequest(BaseModel):
    """Request to generate and send a receipt."""
    
    transaction_id: int = Field(
        ...,
        description="Transaction to generate receipt for"
    )
    delivery_method: Literal["sms", "email", "print"] = Field(
        default="sms",
        description="How to deliver the receipt"
    )
    recipient: Optional[str] = Field(
        default=None,
        description="Override recipient (phone or email). Uses transaction customer if not provided."
    )


class ReceiptResponse(BaseModel):
    """Response after generating a receipt."""
    
    status: str = "success"
    receipt_id: int
    receipt_number: str
    transaction_id: int
    delivery_method: str
    delivered: bool
    recipient: Optional[str] = None
    pdf_url: Optional[str] = None


class ReceiptDetails(BaseModel):
    """Full receipt details for display/printing."""
    
    receipt_number: str
    transaction_id: int
    amount: str  # Formatted with currency symbol
    currency: str
    payment_method: str
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None
    customer_name: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    
    # Business info (from config)
    business_name: str = "POS System"
    business_address: Optional[str] = None
    business_phone: Optional[str] = None
