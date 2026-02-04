"""
Payment Link Model

Stores Stripe Payment Links sent to customers via SMS.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    Boolean,
    Text,
    ForeignKey,
)

from app.database import Base


class PaymentLink(Base):
    """
    Stripe Payment Link record.
    
    Used for sending payment requests to customers via SMS.
    Customer clicks link -> completes payment on Stripe hosted page.
    
    Attributes:
        id: Primary key
        stripe_link_id: Stripe Payment Link ID
        stripe_price_id: Stripe Price ID (for the payment)
        url: Full payment URL to send to customer
        amount: Payment amount in smallest currency unit
        currency: ISO 4217 currency code
        customer_phone: Phone number for SMS delivery
        customer_name: Customer name (optional)
        description: What the payment is for
        sms_sent: Whether SMS was successfully sent
        sms_sent_at: When SMS was sent
        expires_at: When link expires (optional)
        paid: Whether payment was completed
        paid_at: When payment was completed
        transaction_id: Linked transaction after payment
        created_at: When link was created
    """
    
    __tablename__ = "payment_links"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Stripe references
    stripe_link_id = Column(String(255), unique=True, index=True)
    stripe_price_id = Column(String(255))
    stripe_session_id = Column(String(255))  # Checkout session if used
    
    # Payment URL
    url = Column(Text, nullable=False)
    
    # Amount
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    
    # Customer info
    customer_phone = Column(String(20), nullable=False)
    customer_name = Column(String(255))
    
    # Description
    description = Column(Text)
    
    # SMS tracking
    sms_sent = Column(Boolean, default=False)
    sms_sent_at = Column(DateTime)
    sms_message_id = Column(String(255))  # Africa's Talking message ID
    
    # Payment status
    paid = Column(Boolean, default=False, index=True)
    paid_at = Column(DateTime)
    
    # Link to transaction after payment completes
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    
    # Expiration
    expires_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    
    def __repr__(self) -> str:
        return f"<PaymentLink(id={self.id}, amount={self.amount}, paid={self.paid})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if payment link has expired."""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_pending(self) -> bool:
        """Check if payment is still pending."""
        return not self.paid and not self.is_expired
