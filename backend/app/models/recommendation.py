"""Recommendation database model."""

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.models.base import BaseModel


class Recommendation(BaseModel):
    """Recommendations table."""

    __tablename__ = "recommendations"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    recommendation_type = Column(
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

    recommended_skills = Column(
        JSON,
        nullable=True,
    )

    priority = Column(
        String,
        default="medium",
    )

    reason = Column(
        Text,
        nullable=True,
    )

    extra_data = Column(
        JSON,
        nullable=True,
    )
