"""
CORS Middleware Configuration

Configures Cross-Origin Resource Sharing for the API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings


def setup_cors(app: FastAPI) -> None:
    """
    Add CORS middleware to the FastAPI app.
    
    Allows frontend applications to make requests to the API
    from different origins (e.g., localhost:5173 for Vite dev server).
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-Idempotency-Key",
        ],
        expose_headers=["X-Request-Id"],
        max_age=600,  # Cache preflight requests for 10 minutes
    )
