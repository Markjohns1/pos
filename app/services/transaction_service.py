"""
Transaction Service

Business logic for transaction management.
Handles database operations and webhook events.
"""

from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.transaction import Transaction
from app.utils import logger


class TransactionService:
    """
    Service for managing transactions.
    
    Responsibilities:
    - CRUD operations for transactions
    - Handle Stripe webhook events
    - Transaction queries and reporting
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_transaction(self, transaction_id: int) -> Optional[Transaction]:
        """Get a transaction by ID."""
        return self.db.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
    
    def get_by_payment_intent(self, payment_intent_id: str) -> Optional[Transaction]:
        """Get a transaction by Stripe PaymentIntent ID."""
        return self.db.query(Transaction).filter(
            Transaction.stripe_payment_intent_id == payment_intent_id
        ).first()
    
    def list_transactions(
        self,
        page: int = 1,
        per_page: int = 20,
        status: Optional[str] = None,
    ) -> Tuple[List[Transaction], int]:
        """
        List transactions with pagination and filtering.
        
        Args:
            page: Page number (1-indexed)
            per_page: Items per page
            status: Filter by status (optional)
            
        Returns:
            Tuple of (transactions, total_count)
        """
        query = self.db.query(Transaction)
        
        # Apply status filter
        if status:
            query = query.filter(Transaction.status == status)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        transactions = (
            query
            .order_by(desc(Transaction.created_at))
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        
        return transactions, total
    
    async def handle_payment_success(self, payment_intent: dict) -> None:
        """
        Handle payment_intent.succeeded webhook event.
        
        Updates transaction status and stores card details (last4 only).
        """
        transaction = self.get_by_payment_intent(payment_intent.id)
        
        if not transaction:
            logger.warning(
                "Transaction not found for payment intent",
                payment_intent_id=payment_intent.id,
            )
            return
        
        # Update status
        transaction.status = "succeeded"
        
        # Store safe card details (last 4 digits only)
        if payment_intent.charges and payment_intent.charges.data:
            charge = payment_intent.charges.data[0]
            if charge.payment_method_details and charge.payment_method_details.card:
                card = charge.payment_method_details.card
                transaction.card_last4 = card.last4
                transaction.card_brand = card.brand
        
        self.db.commit()
        
        logger.info(
            "Payment succeeded",
            transaction_id=transaction.id,
            payment_intent_id=payment_intent.id,
        )
    
    async def handle_payment_failure(self, payment_intent: dict) -> None:
        """
        Handle payment_intent.payment_failed webhook event.
        """
        transaction = self.get_by_payment_intent(payment_intent.id)
        
        if not transaction:
            logger.warning(
                "Transaction not found for failed payment",
                payment_intent_id=payment_intent.id,
            )
            return
        
        transaction.status = "failed"
        self.db.commit()
        
        logger.info(
            "Payment failed",
            transaction_id=transaction.id,
            payment_intent_id=payment_intent.id,
        )
    
    async def handle_checkout_complete(self, session: dict) -> None:
        """
        Handle checkout.session.completed webhook event.
        
        Used when customer completes payment via Payment Link.
        """
        payment_intent_id = session.get("payment_intent")
        
        if payment_intent_id:
            transaction = self.get_by_payment_intent(payment_intent_id)
            if transaction:
                transaction.status = "succeeded"
                self.db.commit()
                
                logger.info(
                    "Checkout completed",
                    transaction_id=transaction.id,
                    session_id=session.id,
                )
    
    async def handle_refund(self, charge: dict) -> None:
        """
        Handle charge.refunded webhook event.
        """
        payment_intent_id = charge.get("payment_intent")
        
        if payment_intent_id:
            transaction = self.get_by_payment_intent(payment_intent_id)
            if transaction:
                transaction.status = "refunded"
                self.db.commit()
                
                logger.info(
                    "Charge refunded",
                    transaction_id=transaction.id,
                )
