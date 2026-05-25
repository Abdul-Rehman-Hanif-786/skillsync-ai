"""Application configuration settings."""

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings."""

    PROJECT_NAME = "SkillSync AI"
    VERSION = "1.0.0"

    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES"
    )


settings = Settings()
