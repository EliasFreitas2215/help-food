from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    # JWT
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_EXPIRES_MINUTES: int = 120

    # App
    APP_BASE_URL: str = "http://localhost:5173"

    # SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""

    # n8n / IA - Sprint 3
    N8N_RECIPE_WEBHOOK_URL: str = ""
    N8N_WEBHOOK_TIMEOUT_SECONDS: int = 60
    N8N_ALLOW_MOCK_RECIPE: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()