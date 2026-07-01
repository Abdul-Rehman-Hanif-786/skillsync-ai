"""Skill management routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.db.session import get_db
from app.models.skill import Skill
from app.schemas.profile import SkillResponse, SkillBase

router = APIRouter(
    prefix="/skills",
    tags=["Skills"],
)


@router.post("/", response_model=SkillResponse)
async def create_skill(
    skill_data: SkillBase,
    db: AsyncSession = Depends(get_db),
):
    """Create a new skill (admin only)."""
    
    # Check if skill already exists
    query = select(Skill).where(Skill.name == skill_data.name)
    result = await db.execute(query)
    existing_skill = result.scalar_one_or_none()
    
    if existing_skill:
        raise HTTPException(
            status_code=400,
            detail="Skill already exists",
        )
    
    skill = Skill(
        name=skill_data.name,
        category=skill_data.category,
        description=skill_data.description,
    )
    
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    
    return skill


@router.get("/search", response_model=List[SkillResponse])
async def search_skills(
    q: str = Query(..., description="Search query"),
    db: AsyncSession = Depends(get_db),
):
    """Search skills by name — used by frontend autocomplete."""
    query = select(Skill).where(
        Skill.name.ilike(f"%{q}%")
    ).order_by(Skill.name).limit(20)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/", response_model=List[SkillResponse])
async def get_all_skills(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search skills by name"),
    db: AsyncSession = Depends(get_db),
):
    """Get all skills with optional filtering."""
    
    query = select(Skill)
    
    if category:
        query = query.where(Skill.category == category)
    
    if search:
        query = query.where(
            Skill.name.ilike(f"%{search}%")
        )
    
    query = query.order_by(Skill.name)
    
    result = await db.execute(query)
    skills = result.scalars().all()
    
    return skills


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(
    skill_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific skill by ID."""
    
    query = select(Skill).where(Skill.id == uuid.UUID(skill_id))
    result = await db.execute(query)
    skill = result.scalar_one_or_none()
    
    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found",
        )
    
    return skill


@router.get("/categories", response_model=List[str])
async def get_skill_categories(
    db: AsyncSession = Depends(get_db),
):
    """Get all available skill categories."""
    
    query = select(Skill.category).where(
        Skill.category.isnot(None)
    ).distinct()
    
    result = await db.execute(query)
    categories = [row[0] for row in result.all()]
    
    return categories
