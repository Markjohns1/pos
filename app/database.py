"""
Database Connection & Session Management

Handles SQLAlchemy engine, session factory, and dependency injection.
Supports both SQLite (dev) and PostgreSQL (production).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

from app.config import settings


# Engine Configuration

# SQLite needs special handling for connection pooling
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.is_development,  # Log SQL in dev mode
    )
else:
    # PostgreSQL with connection pooling
    engine = create_engine(
        settings.database_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections are alive
        echo=settings.is_development,
    )


# Session Factory

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# Base Model

Base = declarative_base()


# Dependency Injection

def get_db():
    """
    FastAPI dependency that provides a database session.
    
    Usage:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    
    Automatically closes session after request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    
    Call this on application startup to create all tables.
    In production, use Alembic migrations instead.
    """
    # Import all models here to register them with Base
    from app.models import transaction, payment_link, receipt  # noqa
    
    Base.metadata.create_all(bind=engine)
