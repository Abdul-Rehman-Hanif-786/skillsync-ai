"""Profile API routes."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.schemas.profile import (
    ProfileCreate,
    ProfileUpdate,
    ProfileResponse,
    UserSkillCreate,
    UserSkillResponse,
)

from sqlalchemy.orm import selectinload

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


async def _get_profile(user_uuid, db):
    """Helper to fetch profile with all skills eagerly loaded."""
    result = await db.execute(
        select(Profile)
        .options(
            selectinload(Profile.skills).selectinload(UserSkill.skill)
        )
        .where(Profile.user_id == user_uuid)
    )
    return result.scalar_one_or_none()


@router.get("/", response_model=ProfileResponse)
@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's profile. Returns 404 if not created yet."""
    user_uuid = uuid.UUID(current_user["user_id"])
    profile = await _get_profile(user_uuid, db)

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    return profile


@router.post("/", response_model=ProfileResponse, status_code=201)
async def create_profile(
    profile_data: ProfileCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new profile for the current user."""
    user_uuid = uuid.UUID(current_user["user_id"])

    existing = await _get_profile(user_uuid, db)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists. Use PUT /profile/ to update.",
        )

    profile = Profile(
        user_id=user_uuid,
        bio=profile_data.bio,
        current_role=profile_data.current_role,
        target_role=profile_data.target_role,
        location=profile_data.location,
        years_of_experience=profile_data.years_of_experience,
        experience_level=profile_data.experience_level,
        github_url=profile_data.github_url,
        linkedin_url=profile_data.linkedin_url,
        interests=profile_data.interests,
    )

    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.put("/", response_model=ProfileResponse)
async def upsert_profile(
    profile_data: ProfileUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update existing profile, or create it if it doesn't exist yet (upsert).
    Frontend always calls PUT — this handles both cases.
    """
    user_uuid = uuid.UUID(current_user["user_id"])
    profile = await _get_profile(user_uuid, db)

    if not profile:
        # Auto-create on first PUT
        profile = Profile(user_id=user_uuid)
        db.add(profile)

    # Apply all provided fields
    fields = [
        "bio", "current_role", "target_role", "location",
        "years_of_experience", "experience_level",
        "github_url", "linkedin_url", "interests",
    ]
    for field in fields:
        value = getattr(profile_data, field, None)
        if value is not None:
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/skills/", response_model=UserSkillResponse)
@router.post("/skills", response_model=UserSkillResponse)
async def add_skill(
    skill_data: UserSkillCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a skill to the current user's profile."""
    user_uuid = uuid.UUID(current_user["user_id"])
    profile = await _get_profile(user_uuid, db)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first.",
        )

    # Validate skill exists
    skill_result = await db.execute(
        select(Skill).where(Skill.id == uuid.UUID(skill_data.skill_id))
    )
    skill = skill_result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    # Check duplicate
    dup_result = await db.execute(
        select(UserSkill).where(
            UserSkill.profile_id == profile.id,
            UserSkill.skill_id == skill.id,
        )
    )
    if dup_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Skill already added.")

    user_skill = UserSkill(
        profile_id=profile.id,
        skill_id=skill.id,
        proficiency_level=skill_data.proficiency_level or skill_data.proficiency,
    )
    db.add(user_skill)
    await db.commit()
    await db.refresh(user_skill)

    # Reload with skill relationship for serialization
    result = await db.execute(
        select(UserSkill)
        .options(selectinload(UserSkill.skill))
        .where(UserSkill.id == user_skill.id)
    )
    user_skill = result.scalar_one()
    return user_skill


@router.delete("/skills/{skill_id}")
async def remove_skill(
    skill_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a skill from the current user's profile."""
    user_uuid = uuid.UUID(current_user["user_id"])
    profile = await _get_profile(user_uuid, db)

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    us_result = await db.execute(
        select(UserSkill).where(
            UserSkill.profile_id == profile.id,
            UserSkill.skill_id == uuid.UUID(skill_id),
        )
    )
    user_skill = us_result.scalar_one_or_none()

    if not user_skill:
        raise HTTPException(status_code=404, detail="Skill not in profile.")

    await db.delete(user_skill)
    await db.commit()
    return {"message": "Skill removed successfully"}
