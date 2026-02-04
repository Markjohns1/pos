"""
Receipt Endpoints

Generate and deliver receipts for transactions.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.receipt import ReceiptRequest, ReceiptResponse
from app.services.receipt_service import ReceiptService
from app.utils import logger


router = APIRouter(prefix="/receipts")


@router.post("", response_model=ReceiptResponse)
async def generate_receipt(
    receipt_data: ReceiptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Generate and optionally deliver a receipt.
    
    Delivery methods:
    - sms: Send receipt summary via SMS
    - email: Send full receipt via email
    - print: Generate PDF for printing
    """
    logger.info(
        "Generating receipt",
        transaction_id=receipt_data.transaction_id,
        method=receipt_data.delivery_method,
    )
    
    service = ReceiptService(db)
    result = await service.generate_receipt(receipt_data)
    
    return result


@router.get("/{receipt_id}")
async def get_receipt(
    receipt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get receipt details by ID.
    """
    service = ReceiptService(db)
    receipt = service.get_receipt(receipt_id)
    
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    return {
        "status": "success",
        "data": {
            "id": receipt.id,
            "receipt_number": receipt.receipt_number,
            "transaction_id": receipt.transaction_id,
            "delivery_method": receipt.delivery_method,
            "delivered": receipt.delivered,
            "recipient": receipt.recipient,
            "pdf_path": receipt.pdf_path,
            "created_at": receipt.created_at.isoformat(),
        }
    }


@router.get("/by-transaction/{transaction_id}")
async def get_receipts_for_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get all receipts for a transaction.
    """
    service = ReceiptService(db)
    receipts = service.get_receipts_for_transaction(transaction_id)
    
    return {
        "status": "success",
        "data": [
            {
                "id": r.id,
                "receipt_number": r.receipt_number,
                "delivery_method": r.delivery_method,
                "delivered": r.delivered,
                "created_at": r.created_at.isoformat(),
            }
            for r in receipts
        ]
    }
