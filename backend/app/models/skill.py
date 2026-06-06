"""Skill database model."""

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Skill(BaseModel):
    """Master skills table."""

    __tablename__ = "skills"

    name = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    category = Column(
        String,
        nullable=True,
        index=True,
    )

    description = Column(String, nullable=True)

    # Relationships
    users = relationship(
        "UserSkill",
        backref="skill",
        lazy="selectin",
        cascade="all, delete-orphan"
    )
