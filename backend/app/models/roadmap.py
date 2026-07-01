"""Roadmap database model."""

from sqlalchemy import Column, ForeignKey, String, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.models.base import BaseModel


class Roadmap(BaseModel):
    """Learning roadmaps table."""

    __tablename__ = "roadmaps"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    target_role = Column(
        String,
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    duration_months = Column(
        Integer,
        nullable=True,
    )

    steps = Column(
        JSON,
        nullable=True,
    )

    resources = Column(
        JSON,
        nullable=True,
    )

    extra_data = Column(
        JSON,
        nullable=True,
    )
