"""
Transaction Model

Stores all payment transaction records.
NEVER stores full card numbers - only last 4 digits (safe to store).
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    Text,
    Index,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Transaction(Base):
    """
    Payment transaction record.
    
    Attributes:
        id: Primary key
        stripe_payment_intent_id: Stripe PaymentIntent ID (unique)
        amount: Amount in smallest currency unit (cents)
        currency: ISO 4217 currency code (USD, KES, EUR)
        status: Transaction status (pending, succeeded, failed, refunded)
        payment_method: How payment was made (card, payment_link, terminal)
        card_last4: Last 4 digits of card (safe to store)
        card_brand: Card network (visa, mastercard, amex)
        customer_email: Customer email (optional)
        customer_phone: Customer phone for SMS receipt
        description: Transaction description/memo
        metadata: Additional JSON metadata
        created_at: When transaction was created
        updated_at: Last update timestamp
    """
    
    __tablename__ = "transactions"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Stripe reference (indexed for lookups)
    stripe_payment_intent_id = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )
    
    # Amount stored in smallest currency unit (cents/pennies)
    # This avoids floating point precision issues
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    
    # Transaction status
    status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
    )
    
    # Payment method details
    payment_method = Column(String(50))  # card, payment_link, terminal
    card_last4 = Column(String(4))  # ONLY last 4 digits - safe to store
    card_brand = Column(String(50))  # visa, mastercard, amex, etc.
    
    # Customer info
    customer_email = Column(String(255))
    customer_phone = Column(String(20))
    
    # Description
    description = Column(Text)
    
    # Timestamps (always UTC)
    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        index=True,  # For date range queries
    )
    updated_at = Column(
        DateTime,
        onupdate=datetime.utcnow,
    )
    
    # Relationships
    receipts = relationship("Receipt", back_populates="transaction")
    
    # Composite indexes for common queries
    __table_args__ = (
        Index("ix_transactions_status_created", "status", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, amount={self.amount}, status={self.status})>"
    
    @property
    def amount_display(self) -> str:
        """Format amount for display (e.g., 'USD 10.00')."""
        symbols = {"USD": "$", "EUR": "EUR", "GBP": "GBP", "KES": "KSh"}
        symbol = symbols.get(self.currency, self.currency)
        return f"{symbol}{self.amount:,.2f}"
    
    @property
    def is_successful(self) -> bool:
        """Check if transaction completed successfully."""
        return self.status == "succeeded"
    
    @property
    def is_refundable(self) -> bool:
        """Check if transaction can be refunded."""
        return self.status == "succeeded"
