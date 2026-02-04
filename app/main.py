"""
POS System - Main Application Entry Point

FastAPI application with all routes, middleware, and startup events.
Run with: uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.config import settings
from app.database import init_db
from app.routes import api_router
from app.utils import logger, setup_logging, POSException


# Lifespan Events

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    
    Startup: Initialize logging, database, etc.
    Shutdown: Clean up resources.
    """
    # Startup
    setup_logging()
    logger.info(
        "Starting POS System",
        version=__version__,
        environment=settings.app_env,
    )
    
    # Initialize database tables (dev only - use migrations in prod)
    if settings.is_development:
        init_db()
        logger.info("Database tables created")
    
    yield
    
    # Shutdown
    logger.info("Shutting down POS System")


# Create FastAPI App

app = FastAPI(
    title="POS System API",
    description=(
        "Point of Sale system with Stripe payment integration, "
        "SMS payment links, and receipt generation."
    ),
    version=__version__,
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)


# Middleware

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers

@app.exception_handler(POSException)
async def pos_exception_handler(request: Request, exc: POSException):
    """
    Handle custom POS exceptions.
    
    Converts exceptions to consistent JSON error responses.
    """
    logger.warning(
        "POS exception",
        code=exc.code,
        message=exc.message,
        path=request.url.path,
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler.
    
    Prevents stack traces from leaking to clients in production.
    """
    logger.error(
        "Unhandled exception",
        error=str(exc),
        path=request.url.path,
        exc_info=True,
    )
    
    # Don't expose details in production
    message = str(exc) if settings.is_development else "Internal server error"
    
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": message,
            "code": "INTERNAL_ERROR",
        },
    )


# Register Routes

app.include_router(api_router)


# Root Endpoint

@app.get("/")
async def root():
    """
    Root endpoint - basic API info.
    """
    return {
        "name": "POS System API",
        "version": __version__,
        "docs": "/docs" if settings.is_development else None,
        "health": "/api/v1/health",
    }


# Run with Uvicorn

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development,
    )
