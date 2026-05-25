"""Profile database model."""

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class Profile(BaseModel):
    """Profile table."""

    __tablename__ = "profiles"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    bio = Column(String)

    github_url = Column(String)

    linkedin_url = Column(String)
    