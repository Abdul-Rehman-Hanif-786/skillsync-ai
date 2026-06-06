"""Profile database model."""

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Profile(BaseModel):
    """Profile table."""

    __tablename__ = "profiles"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
    )

    bio = Column(Text, nullable=True)

    github_url = Column(String, nullable=True)

    linkedin_url = Column(String, nullable=True)
    
    experience_level = Column(String, nullable=True)
    
    target_role = Column(String, nullable=True)
    
    interests = Column(JSON, nullable=True)

    # Relationships
    skills = relationship(
        "UserSkill",
        backref="profile",
        lazy="selectin",
        cascade="all, delete-orphan"
    )
    