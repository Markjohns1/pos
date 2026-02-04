"""
API Routes

All endpoint definitions organized by resource.
"""

from fastapi import APIRouter

from app.routes.health import router as health_router
from app.routes.transactions import router as transactions_router
from app.routes.payment_links import router as payment_links_router
from app.routes.webhooks import router as webhooks_router
from app.routes.receipts import router as receipts_router
from app.routes.auth import router as auth_router


# Main API router that includes all sub-routers
api_router = APIRouter(prefix="/api/v1")

# Register all route modules
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(auth_router)
api_router.include_router(transactions_router, tags=["Transactions"])
api_router.include_router(payment_links_router, tags=["Payment Links"])
api_router.include_router(receipts_router, tags=["Receipts"])
api_router.include_router(webhooks_router, tags=["Webhooks"])


__all__ = ["api_router"]
