from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CreatorInsight"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "hackathon-secret-key-change-in-production-32chars"
    FRONTEND_URL: str = "http://localhost:3000"
    API_V1_PREFIX: str = "/api/v1"

    # Database — SQLite, no Docker needed
    DATABASE_URL: str = "sqlite+aiosqlite:///./creatorinsight.db"
    DATABASE_URL_SYNC: str = "sqlite:///./creatorinsight.db"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # AI — Anthropic (get free key at console.anthropic.com)
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # Social OAuth (leave empty — seeded data used for demo)
    INSTAGRAM_CLIENT_ID: str = ""
    INSTAGRAM_CLIENT_SECRET: str = ""
    YOUTUBE_CLIENT_ID: str = ""
    YOUTUBE_CLIENT_SECRET: str = ""
    TIKTOK_CLIENT_KEY: str = ""
    TIKTOK_CLIENT_SECRET: str = ""
    TWITTER_CLIENT_ID: str = ""
    TWITTER_CLIENT_SECRET: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
