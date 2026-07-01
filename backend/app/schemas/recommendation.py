"""Recommendation schemas."""

from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class RecommendationResponse(BaseModel):
    """Recommendation response schema."""

    id: UUID
    recommendation_type: str
    title: str
    description: Optional[str] = None
    recommended_skills: Optional[List[dict]] = None
    priority: str
    reason: Optional[str] = None
    extra_data: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RecommendationGenerateRequest(BaseModel):
    """Request to generate recommendations."""

    target_role: Optional[str] = None
    generate_type: str = "all"  # all, skills, career, projects


class SkillGapAnalysis(BaseModel):
    """Skill gap analysis response."""

    current_skills: List[str]
    required_skills: List[str]
    missing_skills: List[str]
    skill_match_percentage: float
    recommendations: List[str]
