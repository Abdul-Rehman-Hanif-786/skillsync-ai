"""Resume schemas."""

from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ResumeResponse(BaseModel):
    """Resume response schema."""

    id: UUID
    filename: str
    extracted_text: Optional[str] = None
    extracted_skills: Optional[List[dict]] = None
    parsing_status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeUploadResponse(BaseModel):
    """Resume upload response schema."""

    message: str
    resume: ResumeResponse
    extracted_skills_count: int
