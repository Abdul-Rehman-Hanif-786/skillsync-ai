from typing import Optional, List
from pydantic import BaseModel, field_validator
from datetime import datetime
from uuid import UUID


# Skill Schemas
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
    proficiency_level: Optional[str] = None


class UserSkillResponse(BaseModel):
    id: UUID
    skill: SkillResponse
    proficiency_level: Optional[str] = None

    class Config:
        from_attributes = True


# Profile Schemas
class ProfileCreate(BaseModel):
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience_level: Optional[str] = None
    target_role: Optional[str] = None
    interests: Optional[List[str]] = None


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience_level: Optional[str] = None
    target_role: Optional[str] = None
    interests: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    id: UUID
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience_level: Optional[str] = None
    target_role: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[UserSkillResponse]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True