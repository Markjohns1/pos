"""
Payment Service

Handles Stripe API interactions for payments.
All Stripe-specific logic is contained here.
"""

from typing import Optional
import stripe
from sqlalchemy.orm import Session

from app.config import settings
from app.models.transaction import Transaction
from app.schemas.payment import PaymentRequest
from app.utils import logger, PaymentError, StripeError


# Configure Stripe
stripe.api_key = settings.stripe_secret_key


class PaymentService:
    """
    Service for processing payments via Stripe.
    
    Responsibilities:
    - Create PaymentIntents
    - Process refunds
    - Sync with Stripe status
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_payment(self, payment_data: PaymentRequest) -> dict:
        """
        Create a new payment.
        
        1. Create Stripe PaymentIntent
        2. Save transaction record
        3. Return client_secret for frontend
        
        Args:
            payment_data: Validated payment request
            
        Returns:
            Payment response with client_secret
            
        Raises:
            PaymentError: If payment creation fails
        """
        try:
            # Build PaymentIntent params
            intent_params = {
                "amount": payment_data.amount,
                "currency": payment_data.currency.lower(),
                "automatic_payment_methods": {"enabled": True},
            }
            
            # Add idempotency key if provided (prevents duplicate charges)
            idempotency_key = payment_data.idempotency_key
            
            # Add description if provided
            if payment_data.description:
                intent_params["description"] = payment_data.description
            
            # Add customer email for receipts
            if payment_data.customer_email:
                intent_params["receipt_email"] = payment_data.customer_email
            
            # Create PaymentIntent in Stripe
            intent = stripe.PaymentIntent.create(
                **intent_params,
                idempotency_key=idempotency_key,
            )
            
            logger.info(
                "Created PaymentIntent",
                payment_intent_id=intent.id,
                amount=payment_data.amount,
            )
            
            # Save transaction to database
            transaction = Transaction(
                stripe_payment_intent_id=intent.id,
                amount=payment_data.amount / 100,  # Convert cents to dollars
                currency=payment_data.currency.upper(),
                status="pending",
                payment_method="card",
                customer_email=payment_data.customer_email,
                customer_phone=payment_data.customer_phone,
                description=payment_data.description,
            )
            
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            
            logger.info(
                "Transaction created",
                transaction_id=transaction.id,
                payment_intent_id=intent.id,
            )
            
            return {
                "status": "success",
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "amount": payment_data.amount,
                "currency": payment_data.currency,
                "transaction_id": transaction.id,
            }
            
        except stripe.error.CardError as e:
            logger.warning("Card error", error=str(e))
            raise PaymentError(
                message="Card was declined",
                code="CARD_DECLINED",
                details={"decline_code": e.code},
            )
        except stripe.error.StripeError as e:
            logger.error("Stripe error", error=str(e))
            raise StripeError(
                message="Payment service error",
                details={"stripe_error": str(e)},
            )
        except Exception as e:
            logger.error("Unexpected payment error", error=str(e))
            raise PaymentError(
                message="Payment processing failed",
                details={"error": str(e)},
            )
    
    async def refund_payment(
        self,
        transaction_id: int,
        amount: Optional[int] = None,
    ) -> dict:
        """
        Refund a payment (full or partial).
        
        Args:
            transaction_id: Transaction to refund
            amount: Partial refund amount in cents (None for full refund)
            
        Returns:
            Refund response
            
        Raises:
            PaymentError: If refund fails
        """
        # Get transaction
        transaction = self.db.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
        
        if not transaction:
            raise PaymentError(
                message="Transaction not found",
                code="TRANSACTION_NOT_FOUND",
            )
        
        if not transaction.is_refundable:
            raise PaymentError(
                message="Transaction cannot be refunded",
                code="NOT_REFUNDABLE",
                details={"status": transaction.status},
            )
        
        if not transaction.stripe_payment_intent_id:
            raise PaymentError(
                message="No payment intent found for transaction",
                code="NO_PAYMENT_INTENT",
            )
        
        try:
            # Create refund in Stripe
            refund_params = {
                "payment_intent": transaction.stripe_payment_intent_id,
            }
            
            if amount:
                refund_params["amount"] = amount
            
            refund = stripe.Refund.create(**refund_params)
            
            # Update transaction status
            transaction.status = "refunded"
            self.db.commit()
            
            logger.info(
                "Refund processed",
                refund_id=refund.id,
                transaction_id=transaction_id,
                amount=refund.amount,
            )
            
            return {
                "status": "success",
                "refund_id": refund.id,
                "amount": refund.amount,
                "currency": refund.currency.upper(),
                "transaction_id": transaction_id,
            }
            
        except stripe.error.StripeError as e:
            logger.error("Refund failed", error=str(e))
            raise StripeError(
                message="Refund processing failed",
                details={"stripe_error": str(e)},
            )
    
    async def get_payment_status(self, payment_intent_id: str) -> dict:
        """
        Get current status of a payment from Stripe.
        
        Useful for syncing status if webhook was missed.
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount": intent.amount,
                "currency": intent.currency,
            }
        except stripe.error.StripeError as e:
            logger.error("Failed to get payment status", error=str(e))
            raise StripeError(
                message="Failed to retrieve payment status",
                details={"stripe_error": str(e)},
            )
