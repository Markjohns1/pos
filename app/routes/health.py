"""
Health Check Endpoint

Used by load balancers and monitoring systems.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app import __version__
from app.database import get_db
from app.config import settings
from app.schemas.common import HealthResponse


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)) -> dict:
    """
    Health check endpoint.
    
    Checks:
    - API is responding
    - Database connection is alive
    - Stripe is configured
    
    Returns 200 if healthy, 503 if degraded.
    """
    
    response = {
        "status": "healthy",
        "version": __version__,
        "database": "disconnected",
        "stripe": "not_configured",
    }
    
    # Check database connection
    try:
        db.execute(text("SELECT 1"))
        response["database"] = "connected"
    except Exception:
        response["status"] = "degraded"
        response["database"] = "error"
    
    # Check Stripe configuration
    if settings.stripe_secret_key and settings.stripe_secret_key.startswith("sk_"):
        response["stripe"] = "configured"
    else:
        response["stripe"] = "not_configured"
    
    return response


@router.get("/health/ready")
async def readiness_check() -> dict:
    """
    Kubernetes readiness probe.
    
    Returns 200 when app is ready to receive traffic.
    """
    return {"ready": True}


@router.get("/health/live")
async def liveness_check() -> dict:
    """
    Kubernetes liveness probe.
    
    Returns 200 when app is alive (not frozen/deadlocked).
    """
    return {"alive": True}
