"""
Receipt Model

Stores generated receipt records for transactions.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Receipt(Base):
    """
    Receipt record for a transaction.
    
    Attributes:
        id: Primary key
        receipt_number: Unique receipt number for display
        transaction_id: Foreign key to Transaction
        delivery_method: How receipt was sent (sms, email, print)
        delivered: Whether receipt was successfully delivered
        delivered_at: When receipt was delivered
        recipient: Phone/email where receipt was sent
        pdf_path: Path to generated PDF (if any)
        created_at: When receipt was created
    """
    
    __tablename__ = "receipts"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Human-readable receipt number
    receipt_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )
    
    # Link to transaction
    transaction_id = Column(
        Integer,
        ForeignKey("transactions.id"),
        nullable=False,
        index=True,
    )
    
    # Delivery info
    delivery_method = Column(String(20), nullable=False)  # sms, email, print
    recipient = Column(String(255))  # Phone or email
    
    # Delivery status
    delivered = Column(Boolean, default=False)
    delivered_at = Column(DateTime)
    delivery_error = Column(Text)  # Error message if delivery failed
    
    # PDF storage
    pdf_path = Column(String(500))
    
    # Timestamps
    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    
    # Relationships
    transaction = relationship("Transaction", back_populates="receipts")
    
    def __repr__(self) -> str:
        return f"<Receipt(id={self.id}, number={self.receipt_number})>"
    
    @classmethod
    def generate_receipt_number(cls) -> str:
        """
        Generate a unique receipt number.
        
        Format: RCP-YYMMDD-XXXX (e.g., RCP-240204-0001)
        """
        from datetime import datetime
        import random
        
        date_part = datetime.utcnow().strftime("%y%m%d")
        random_part = f"{random.randint(0, 9999):04d}"
        return f"RCP-{date_part}-{random_part}"
