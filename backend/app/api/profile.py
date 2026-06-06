import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import (
    get_current_user,
)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends

from app.db.session import get_db
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.schemas.profile import (
    ProfileCreate,
    ProfileUpdate,
    ProfileResponse,
    UserSkillCreate,
    UserSkillResponse,
    SkillResponse,
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's profile."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = select(Profile).where(Profile.user_id == user_uuid)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first.",
        )
    
    return profile


@router.post("/", response_model=ProfileResponse)
async def create_profile(
    profile_data: ProfileCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new profile for current user."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    # Check if profile already exists
    query = select(Profile).where(Profile.user_id == user_uuid)
    result = await db.execute(query)
    existing_profile = result.scalar_one_or_none()
    
    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists. Use PUT to update.",
        )
    
    profile = Profile(
        user_id=user_uuid,
        bio=profile_data.bio,
        github_url=profile_data.github_url,
        linkedin_url=profile_data.linkedin_url,
        experience_level=profile_data.experience_level,
        target_role=profile_data.target_role,
        interests=profile_data.interests,
    )

    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    return profile


@router.put("/", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = select(Profile).where(Profile.user_id == user_uuid)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first.",
        )
    
    # Update only provided fields
    if profile_data.bio is not None:
        profile.bio = profile_data.bio
    if profile_data.github_url is not None:
        profile.github_url = profile_data.github_url
    if profile_data.linkedin_url is not None:
        profile.linkedin_url = profile_data.linkedin_url
    if profile_data.experience_level is not None:
        profile.experience_level = profile_data.experience_level
    if profile_data.target_role is not None:
        profile.target_role = profile_data.target_role
    if profile_data.interests is not None:
        profile.interests = profile_data.interests
    
    await db.commit()
    await db.refresh(profile)

    return profile


@router.post("/skills", response_model=UserSkillResponse)
async def add_skill_to_profile(
    skill_data: UserSkillCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a skill to current user's profile."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    # Get user's profile
    profile_query = select(Profile).where(Profile.user_id == user_uuid)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first.",
        )
    
    # Check if skill exists
    skill_query = select(Skill).where(Skill.id == uuid.UUID(skill_data.skill_id))
    skill_result = await db.execute(skill_query)
    skill = skill_result.scalar_one_or_none()
    
    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found.",
        )
    
    # Check if user already has this skill
    existing_query = select(UserSkill).where(
        UserSkill.profile_id == profile.id,
        UserSkill.skill_id == skill.id,
    )
    existing_result = await db.execute(existing_query)
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Skill already added to profile.",
        )
    
    # Add skill to profile
    user_skill = UserSkill(
        profile_id=profile.id,
        skill_id=skill.id,
        proficiency_level=skill_data.proficiency_level,
    )
    
    db.add(user_skill)
    await db.commit()
    await db.refresh(user_skill)
    
    return user_skill


@router.delete("/skills/{skill_id}")
async def remove_skill_from_profile(
    skill_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a skill from current user's profile."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    # Get user's profile
    profile_query = select(Profile).where(Profile.user_id == user_uuid)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found.",
        )
    
    # Find the user_skill
    user_skill_query = select(UserSkill).where(
        UserSkill.profile_id == profile.id,
        UserSkill.skill_id == uuid.UUID(skill_id),
    )
    user_skill_result = await db.execute(user_skill_query)
    user_skill = user_skill_result.scalar_one_or_none()
    
    if not user_skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found in profile.",
        )
    
    await db.delete(user_skill)
    await db.commit()
    
    return {"message": "Skill removed successfully"}
