"""Resume database model."""

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.models.base import BaseModel


class Resume(BaseModel):
    """Resume table."""

    __tablename__ = "resumes"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    filename = Column(
        String,
        nullable=False,
    )

    file_path = Column(
        String,
        nullable=True,
    )

    extracted_text = Column(
        Text,
        nullable=True,
    )

    extracted_skills = Column(
        JSON,
        nullable=True,
    )

    parsing_status = Column(
        String,
        default="pending",
    )
