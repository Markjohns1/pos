"""
Common Schemas

Shared response formats and pagination.
"""

from typing import Any, Optional, List, Generic, TypeVar
from pydantic import BaseModel, Field


T = TypeVar("T")


class SuccessResponse(BaseModel):
    """Standard success response wrapper."""
    
    status: str = "success"
    data: Any = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    
    status: str = "error"
    message: str
    code: str
    details: Optional[dict] = None


class PaginationParams(BaseModel):
    """Pagination query parameters."""
    
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        """Calculate offset for SQL query."""
        return (self.page - 1) * self.per_page


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response."""
    
    status: str = "success"
    data: List[Any]
    pagination: dict = Field(
        description="Pagination info",
        examples=[{"page": 1, "per_page": 20, "total": 100, "total_pages": 5}]
    )


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str = "healthy"
    version: str
    database: str = "connected"
    stripe: str = "configured"
