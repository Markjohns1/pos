"""
Configuration Management

Loads environment variables with validation.
Uses pydantic-settings for type safety.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All settings have sensible defaults for development.
    Production values MUST be set in .env file.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Application
    app_env: str = "development"
    app_debug: bool = True
    app_secret_key: str = "dev-secret-key-change-in-production"
    
    # Database
    database_url: str = "sqlite:///./pos.db"
    
    # Security
    jwt_secret_key: str = "your-jwt-secret-key-change-this"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_terminal_location: str = ""
    
    # Africa's Talking SMS
    at_username: str = "sandbox"
    at_api_key: str = ""
    at_sender_id: str = "POS"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    
    # Logging
    log_level: str = "INFO"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env.lower() == "development"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Uses lru_cache to avoid reading .env file on every request.
    """
    return Settings()


# Convenience: direct access to settings
settings = get_settings()
