"""Roadmap schemas."""

from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class RoadmapGenerateRequest(BaseModel):
    """Request to generate a roadmap."""

    target_role: str
    experience_level: Optional[str] = "beginner"
    interests: Optional[List[str]] = None


class RoadmapResponse(BaseModel):
    """Roadmap response schema."""

    id: UUID
    user_id: UUID
    target_role: str
    title: str
    description: Optional[str] = None
    duration_months: Optional[int] = None
    steps: Optional[List[dict]] = None
    resources: Optional[List[dict]] = None
    extra_data: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CareerAdviceRequest(BaseModel):
    """Request for career advice."""

    question: str


class CareerAdviceResponse(BaseModel):
    """Career advice response."""

    question: str
    answer: str
    timestamp: datetime
