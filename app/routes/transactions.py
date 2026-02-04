"""
Transaction Endpoints

CRUD operations for payment transactions.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionList,
)
from app.schemas.payment import (
    PaymentRequest,
    PaymentResponse,
    RefundRequest,
    RefundResponse,
)
from app.services.payment_service import PaymentService
from app.services.transaction_service import TransactionService
from app.utils import logger


router = APIRouter(prefix="/transactions")


@router.post("/pay", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Create a new payment.
    
    Creates a Stripe PaymentIntent and records the transaction.
    Returns client_secret for frontend to complete payment.
    """
    logger.info(
        "Creating payment",
        amount=payment_data.amount,
        currency=payment_data.currency,
    )
    
    service = PaymentService(db)
    result = await service.create_payment(payment_data)
    
    return result


@router.get("", response_model=TransactionList)
async def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(default=None),
) -> dict:
    """
    List all transactions with pagination.
    
    Query Parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20, max: 100)
    - status: Filter by status (pending, succeeded, failed, refunded)
    """
    service = TransactionService(db)
    transactions, total = service.list_transactions(
        page=page,
        per_page=per_page,
        status=status,
    )
    
    return {
        "status": "success",
        "data": transactions,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        }
    }


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    """
    Get a single transaction by ID.
    """
    service = TransactionService(db)
    transaction = service.get_transaction(transaction_id)
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return TransactionResponse.model_validate(transaction)


@router.post("/{transaction_id}/refund", response_model=RefundResponse)
async def refund_transaction(
    transaction_id: int,
    refund_data: RefundRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Refund a transaction (full or partial).
    """
    logger.info("Processing refund", transaction_id=transaction_id)
    
    service = PaymentService(db)
    result = await service.refund_payment(transaction_id, refund_data.amount)
    
    return result
