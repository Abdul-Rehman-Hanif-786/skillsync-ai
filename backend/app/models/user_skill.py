"""User-Skill relationship model."""

from sqlalchemy import Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

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

    # Eager load skill so serialization always works
    # Note: 'skill' backref is already defined in Skill.users relationship

    __table_args__ = (
        UniqueConstraint("profile_id", "skill_id", name="uq_profile_skill"),
    )
