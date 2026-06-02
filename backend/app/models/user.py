"""User database model."""

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class User(BaseModel):
    """User table."""

    __tablename__ = "users"

    full_name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        nullable=False,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    profile = relationship(
        "Profile",
        backref="user",
        uselist=False,
    )
    