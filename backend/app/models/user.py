"""User database model."""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class User(BaseModel):
    """User table."""

    __tablename__ = "users"

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    # Password reset
    reset_token        = Column(String, nullable=True, index=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    profile = relationship("Profile", backref="user", uselist=False)
