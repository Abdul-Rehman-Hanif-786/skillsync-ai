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

    def model_post_init(self, __context):
        # Sync proficiency = proficiency_level whenever object is created
        if self.proficiency is None and self.proficiency_level is not None:
            object.__setattr__(self, 'proficiency', self.proficiency_level)


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
