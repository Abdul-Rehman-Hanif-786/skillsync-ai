"""User-Skill relationship model."""

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class UserSkill(BaseModel):
    """User skills mapping table."""

    __tablename__ = "user_skills"

    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id"),
        nullable=False,
    )

    skill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skills.id"),
        nullable=False,
    )

    proficiency_level = Column(
        String,
        nullable=True,
    )

    # Unique constraint to prevent duplicate skills
    __table_args__ = (
        # Composite unique constraint
    )
