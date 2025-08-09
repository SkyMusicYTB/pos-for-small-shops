from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_refresh_secret: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    rate_limit_per_minute: int = 60
    app_env: str = "dev"

    class Config:
        env_prefix = ""
        case_sensitive = False
        env_file = ".env"

    @field_validator("database_url")
    def normalize_db_url(cls, v: str) -> str:
        # Accept either postgresql+asyncpg:// (compose) or postgresql:// and normalize to asyncpg-compatible
        if v.startswith("postgresql+asyncpg://"):
            return "postgresql://" + v[len("postgresql+asyncpg://"):]
        if v.startswith("postgresql://") or v.startswith("postgres://"):
            return v
        raise ValueError("DATABASE_URL must start with postgresql:// or postgres://")


settings = Settings()