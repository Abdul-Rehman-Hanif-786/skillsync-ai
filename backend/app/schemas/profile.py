"""Profile schemas."""

from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


# ── Skill schemas ──────────────────────────────────────────────────────────

class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


class SkillResponse(SkillBase):
    id: UUID

    class Config:
        from_attributes = True


class UserSkillCreate(BaseModel):
    skill_id: str
    # Accept either field name from frontend
    proficiency_level: Optional[str] = None
    proficiency: Optional[str] = None   # alias used by SkillsManagement.jsx


class UserSkillResponse(BaseModel):
    id: UUID
    skill: SkillResponse
    proficiency_level: Optional[str] = None
    proficiency: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj, **kwargs):
        instance = super().model_validate(obj, **kwargs)
        # sync proficiency alias
        if instance.proficiency is None and instance.proficiency_level is not None:
            instance.proficiency = instance.proficiency_level
        return instance


# ── Profile schemas ────────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    bio: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    location: Optional[str] = None
    years_of_experience: Optional[int] = None
    experience_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    interests: Optional[List[str]] = None


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    location: Optional[str] = None
    years_of_experience: Optional[int] = None
    experience_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    interests: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    id: UUID
    bio: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    location: Optional[str] = None
    years_of_experience: Optional[int] = None
    experience_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[UserSkillResponse]] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
