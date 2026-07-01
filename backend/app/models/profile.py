"""Profile database model."""

from sqlalchemy import Column, ForeignKey, String, Text, Integer
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

    # Current job title
    current_role = Column(String, nullable=True, key="current_role")

    # Career goal
    target_role = Column(String, nullable=True)

    # Location e.g. "Karachi, Pakistan"
    location = Column(String, nullable=True, key="location")

    # Years of professional experience
    years_of_experience = Column(Integer, nullable=True)

    experience_level = Column(String, nullable=True)

    github_url = Column(String, nullable=True)

    linkedin_url = Column(String, nullable=True)

    interests = Column(JSON, nullable=True)

    # Relationships
    skills = relationship(
        "UserSkill",
        backref="profile",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
