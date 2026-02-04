"""
Payment Link Service

Creates Stripe Payment Links and sends them via SMS.
"""

from datetime import datetime, timedelta
from typing import Optional
import stripe
from sqlalchemy.orm import Session

from app.config import settings
from app.models.payment_link import PaymentLink
from app.schemas.payment import PaymentLinkRequest
from app.services.sms_service import SMSService
from app.utils import logger, PaymentError, StripeError


# Configure Stripe
stripe.api_key = settings.stripe_secret_key


class PaymentLinkService:
    """
    Service for creating and managing payment links.
    
    Flow:
    1. Create a Stripe Checkout Session with a payment link URL
    2. Send the link to customer via SMS
    3. Customer pays on Stripe hosted page
    4. Webhook notifies us of completion
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.sms_service = SMSService()
    
    async def create_payment_link(self, link_data: PaymentLinkRequest) -> dict:
        """
        Create a payment link and optionally send via SMS.
        
        Uses Stripe Checkout Sessions for a hosted payment page.
        
        Args:
            link_data: Validated payment link request
            
        Returns:
            Payment link response with URL
        """
        try:
            # Create a Stripe Checkout Session
            session = stripe.checkout.Session.create(
                mode="payment",
                line_items=[{
                    "price_data": {
                        "currency": link_data.currency.lower(),
                        "product_data": {
                            "name": link_data.description or "Payment",
                        },
                        "unit_amount": link_data.amount,
                    },
                    "quantity": 1,
                }],
                success_url=f"{settings.cors_origins.split(',')[0]}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.cors_origins.split(',')[0]}/payment/cancelled",
                expires_at=int((datetime.utcnow() + timedelta(hours=24)).timestamp()),
            )
            
            logger.info(
                "Created checkout session",
                session_id=session.id,
                url=session.url,
            )
            
            # Save payment link to database
            payment_link = PaymentLink(
                stripe_session_id=session.id,
                url=session.url,
                amount=link_data.amount / 100,
                currency=link_data.currency.upper(),
                customer_phone=link_data.customer_phone,
                customer_name=link_data.customer_name,
                description=link_data.description,
                expires_at=datetime.utcnow() + timedelta(hours=24),
            )
            
            self.db.add(payment_link)
            self.db.commit()
            self.db.refresh(payment_link)
            
            # Send SMS if requested
            sms_sent = False
            if link_data.send_sms:
                sms_sent = await self._send_payment_sms(payment_link)
            
            return {
                "status": "success",
                "link_id": payment_link.id,
                "url": session.url,
                "amount": link_data.amount,
                "currency": link_data.currency,
                "customer_phone": link_data.customer_phone,
                "sms_sent": sms_sent,
                "expires_at": payment_link.expires_at.isoformat() if payment_link.expires_at else None,
            }
            
        except stripe.error.StripeError as e:
            logger.error("Failed to create payment link", error=str(e))
            raise StripeError(
                message="Failed to create payment link",
                details={"stripe_error": str(e)},
            )
    
    async def _send_payment_sms(self, payment_link: PaymentLink) -> bool:
        """
        Send payment link to customer via SMS.
        
        Returns True if SMS was sent successfully.
        """
        # Format amount for display
        amount_display = f"${payment_link.amount:,.2f}"
        
        # Compose message
        message = (
            f"Payment Request: {amount_display}\n"
            f"Pay securely here: {payment_link.url}\n"
            f"Link expires in 24 hours."
        )
        
        try:
            result = await self.sms_service.send_sms(
                phone=payment_link.customer_phone,
                message=message,
            )
            
            if result["success"]:
                payment_link.sms_sent = True
                payment_link.sms_sent_at = datetime.utcnow()
                payment_link.sms_message_id = result.get("message_id")
                self.db.commit()
                
                logger.info(
                    "Payment link SMS sent",
                    link_id=payment_link.id,
                    phone=payment_link.customer_phone,
                )
                return True
            else:
                logger.warning(
                    "Failed to send payment link SMS",
                    link_id=payment_link.id,
                    error=result.get("error"),
                )
                return False
                
        except Exception as e:
            logger.error("SMS sending failed", error=str(e))
            return False
    
    def get_payment_link(self, link_id: int) -> Optional[PaymentLink]:
        """Get a payment link by ID."""
        return self.db.query(PaymentLink).filter(
            PaymentLink.id == link_id
        ).first()
    
    async def resend_sms(self, link_id: int) -> dict:
        """
        Resend payment link SMS.
        """
        payment_link = self.get_payment_link(link_id)
        
        if not payment_link:
            raise PaymentError(
                message="Payment link not found",
                code="LINK_NOT_FOUND",
            )
        
        if payment_link.paid:
            raise PaymentError(
                message="Payment link already paid",
                code="ALREADY_PAID",
            )
        
        if payment_link.is_expired:
            raise PaymentError(
                message="Payment link has expired",
                code="LINK_EXPIRED",
            )
        
        sms_sent = await self._send_payment_sms(payment_link)
        
        return {
            "status": "success" if sms_sent else "failed",
            "sms_sent": sms_sent,
            "link_id": link_id,
        }
