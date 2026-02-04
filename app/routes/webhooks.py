"""
Webhook Endpoints

Handle incoming webhooks from Stripe.
CRITICAL: Always verify webhook signatures before processing.
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
import stripe

from app.database import get_db
from app.config import settings
from app.services.transaction_service import TransactionService
from app.utils import logger


router = APIRouter(prefix="/webhooks")


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    """
    Handle Stripe webhook events.
    
    SECURITY: Verifies webhook signature before processing.
    Stripe signs all webhooks - we MUST verify to prevent spoofing.
    
    Events handled:
    - payment_intent.succeeded: Mark transaction as successful
    - payment_intent.payment_failed: Mark transaction as failed
    - checkout.session.completed: Payment link was paid
    """
    
    # Get raw body for signature verification
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not sig_header:
        logger.warning("Webhook received without signature header")
        raise HTTPException(status_code=400, detail="Missing signature")
    
    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.stripe_webhook_secret,
        )
    except ValueError as e:
        logger.error("Invalid webhook payload", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error("Invalid webhook signature", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Log the event
    logger.info(
        "Stripe webhook received",
        event_type=event.type,
        event_id=event.id,
    )
    
    # Handle specific event types
    service = TransactionService(db)
    
    if event.type == "payment_intent.succeeded":
        payment_intent = event.data.object
        await service.handle_payment_success(payment_intent)
        
    elif event.type == "payment_intent.payment_failed":
        payment_intent = event.data.object
        await service.handle_payment_failure(payment_intent)
        
    elif event.type == "checkout.session.completed":
        session = event.data.object
        await service.handle_checkout_complete(session)
        
    elif event.type == "charge.refunded":
        charge = event.data.object
        await service.handle_refund(charge)
    
    else:
        logger.debug("Unhandled webhook event type", event_type=event.type)
    
    # Always return 200 to acknowledge receipt
    # Stripe retries failed webhooks, so we must acknowledge even if we don't handle
    return {"status": "received", "event_type": event.type}
