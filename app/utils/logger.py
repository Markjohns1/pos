"""
Structured Logging Configuration

Uses structlog for JSON-formatted logs in production
and pretty console logs in development.
"""

import logging
import sys
from typing import Any

import structlog
from structlog.typing import Processor

from app.config import settings


def setup_logging() -> None:
    """
    Configure structured logging for the application.
    
    Call this once at application startup.
    """
    
    # Shared processors for all environments
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.ExtraAdder(),
    ]
    
    if settings.is_development:
        # Pretty console output for development
        processors: list[Processor] = [
            *shared_processors,
            structlog.dev.ConsoleRenderer(colors=True),
        ]
    else:
        # JSON output for production (easier to parse in log aggregators)
        processors = [
            *shared_processors,
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]
    
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.log_level.upper())
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )
    
    # Also configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        level=getattr(logging, settings.log_level.upper()),
        handlers=[logging.StreamHandler(sys.stdout)],
    )


# Create module-level logger instance
logger = structlog.get_logger("pos")


def get_logger(name: str) -> Any:
    """
    Get a named logger instance.
    
    Usage:
        from app.utils.logger import get_logger
        logger = get_logger(__name__)
        logger.info("Something happened", user_id=123)
    """
    return structlog.get_logger(name)
