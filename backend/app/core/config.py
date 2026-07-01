"""Application configuration settings."""

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings."""

    PROJECT_NAME = "SkillSync AI"
    VERSION = "1.0.0"

    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


settings = Settings()
