"""Dashboard schemas."""

from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ProfileStats(BaseModel):
    """Profile completion statistics."""

    profile_completion: float
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    has_bio: bool = False
    has_github: bool = False
    has_linkedin: bool = False


class SkillStats(BaseModel):
    """Skills analytics."""

    total_skills: int
    proficiency_distribution: Dict[str, int] = {}
    recent_skills: List[dict] = []
    top_skills: List[dict] = []


class LearningStats(BaseModel):
    """Learning progress statistics."""

    active_roadmaps: int = 0
    completed_roadmaps: int = 0
    total_roadmaps: int = 0
    current_roadmap: Optional[dict] = None
    learning_streak_days: int = 0


class CareerStats(BaseModel):
    """Career readiness statistics."""

    readiness_level: str = "not_started"
    skill_match_percentage: float = 0.0
    total_required_skills: int = 0
    matched_skills: int = 0
    missing_skills_count: int = 0
    target_role: Optional[str] = None
    strengths: List[str] = []
    next_steps: List[str] = []


class ActivityItem(BaseModel):
    """Single activity item."""

    type: str
    title: str
    timestamp: datetime
    icon: str


class ActivityStats(BaseModel):
    """Recent activity feed."""

    activities: List[ActivityItem] = []
    total_activities: int = 0
    has_more: bool = False


class DashboardStatsResponse(BaseModel):
    """Complete dashboard statistics response."""

    profile: ProfileStats
    skills: SkillStats
    learning: LearningStats
    career: CareerStats
    total_recommendations: int = 0
    total_resumes: int = 0
    last_updated: datetime
