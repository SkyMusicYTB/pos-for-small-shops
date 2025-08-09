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
    def validate_db_url(cls, v: str) -> str:
        assert v.startswith("postgresql+asyncpg://"), "DATABASE_URL must use asyncpg driver"
        return v


settings = Settings(
    database_url="postgresql+asyncpg://pos:pospassword@localhost:5432/pos",
    jwt_secret="devsecret",
    jwt_refresh_secret="devrefresh",
)