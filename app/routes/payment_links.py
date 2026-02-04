"""
Payment Link Endpoints

Create and manage Stripe Payment Links sent via SMS.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.payment import PaymentLinkRequest, PaymentLinkResponse
from app.services.payment_link_service import PaymentLinkService
from app.utils import logger


router = APIRouter(prefix="/payment-links")


@router.post("", response_model=PaymentLinkResponse)
async def create_payment_link(
    link_data: PaymentLinkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Create a payment link and optionally send via SMS.
    
    The link can be sent to the customer's phone via Africa's Talking SMS.
    Customer clicks link -> Stripe hosted checkout page -> Payment complete.
    """
    logger.info(
        "Creating payment link",
        amount=link_data.amount,
        phone=link_data.customer_phone,
        send_sms=link_data.send_sms,
    )
    
    service = PaymentLinkService(db)
    result = await service.create_payment_link(link_data)
    
    return result


@router.get("/{link_id}")
async def get_payment_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get payment link status and details.
    """
    service = PaymentLinkService(db)
    link = service.get_payment_link(link_id)
    
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")
    
    return {
        "status": "success",
        "data": {
            "id": link.id,
            "url": link.url,
            "amount": link.amount,
            "currency": link.currency,
            "customer_phone": link.customer_phone,
            "paid": link.paid,
            "sms_sent": link.sms_sent,
            "is_expired": link.is_expired,
            "created_at": link.created_at.isoformat(),
        }
    }


@router.post("/{link_id}/resend-sms")
async def resend_payment_link_sms(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Resend the payment link via SMS.
    
    Useful if customer didn't receive the first SMS.
    """
    logger.info("Resending payment link SMS", link_id=link_id)
    
    service = PaymentLinkService(db)
    result = await service.resend_sms(link_id)
    
    return result
