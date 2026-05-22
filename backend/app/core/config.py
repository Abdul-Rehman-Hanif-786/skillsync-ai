"""Application configuration settings."""

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings."""

    PROJECT_NAME = "SkillSync AI"
    VERSION = "1.0.0"


settings = Settings()
