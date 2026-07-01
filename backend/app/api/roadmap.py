"""Roadmap and AI API routes."""

import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.roadmap import Roadmap
from app.schemas.roadmap import (
    RoadmapGenerateRequest,
    RoadmapResponse,
    CareerAdviceRequest,
    CareerAdviceResponse,
)
from app.services.ai_service import GroqService

router = APIRouter(
    prefix="/roadmap",
    tags=["AI Roadmap & Career Advice"],
)


@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    request: RoadmapGenerateRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate AI-powered personalized learning roadmap.
    
    - Analyzes user's current skills and profile
    - Uses AI to create step-by-step learning plan
    - Includes resources, projects, and timelines
    - Saves roadmap to database
    """
    
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
    
    # Get user's skills
    user_skills_query = (
        select(UserSkill)
        .options(selectinload(UserSkill.skill))
        .join(Skill)
        .where(UserSkill.profile_id == profile.id)
    )
    user_skills_result = await db.execute(user_skills_query)
    user_skills = user_skills_result.scalars().all()
    
    skill_names = [us.skill.name for us in user_skills]
    
    # Use profile data if not provided in request
    target_role = request.target_role or profile.target_role
    experience_level = request.experience_level or profile.experience_level
    interests = request.interests or profile.interests
    
    if not target_role:
        raise HTTPException(
            status_code=400,
            detail="Target role is required. Set it in your profile or provide it in the request.",
        )
    
    # Generate roadmap using AI
    try:
        ai_service = GroqService()
        roadmap_data = ai_service.generate_learning_roadmap(
            current_skills=skill_names,
            target_role=target_role,
            experience_level=experience_level or "beginner",
            interests=interests,
        )
        
        # Extract phases/steps from AI response
        steps = roadmap_data.get("phases", [])
        resources = []
        
        # Collect all resources from phases
        for phase in steps:
            for topic in phase.get("topics", []):
                resources.extend(topic.get("resources", []))
        
        # Save roadmap to database
        roadmap = Roadmap(
            user_id=user_uuid,
            target_role=target_role,
            title=roadmap_data.get("title", f"Roadmap to {target_role}"),
            description=roadmap_data.get("description", ""),
            duration_months=roadmap_data.get("duration_months", 12),
            steps=steps,
            resources=resources,
            extra_data={
                "tips": roadmap_data.get("tips", []),
                "total_hours": roadmap_data.get("estimated_total_hours", 0),
                "experience_level": experience_level,
                "interests": interests,
            },
        )
        
        db.add(roadmap)
        await db.commit()
        await db.refresh(roadmap)
        
        return roadmap
    
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate roadmap: {str(e)}",
        )


@router.get("/my", response_model=List[RoadmapResponse])
async def get_my_roadmaps(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all roadmaps for current user."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = (
        select(Roadmap)
        .where(Roadmap.user_id == user_uuid)
        .order_by(Roadmap.created_at.desc())
    )
    
    result = await db.execute(query)
    roadmaps = result.scalars().all()
    
    return roadmaps


@router.get("/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap(
    roadmap_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific roadmap."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = select(Roadmap).where(
        Roadmap.id == uuid.UUID(roadmap_id),
        Roadmap.user_id == user_uuid,
    )
    
    result = await db.execute(query)
    roadmap = result.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(
            status_code=404,
            detail="Roadmap not found",
        )
    
    return roadmap


@router.delete("/{roadmap_id}")
async def delete_roadmap(
    roadmap_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a roadmap."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = select(Roadmap).where(
        Roadmap.id == uuid.UUID(roadmap_id),
        Roadmap.user_id == user_uuid,
    )
    
    result = await db.execute(query)
    roadmap = result.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(
            status_code=404,
            detail="Roadmap not found",
        )
    
    await db.delete(roadmap)
    await db.commit()
    
    return {"message": "Roadmap deleted successfully"}


@router.post("/career-advice", response_model=CareerAdviceResponse)
async def get_career_advice(
    request: CareerAdviceRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get AI-powered career advice.
    
    Ask any career-related question and get personalized advice.
    """
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    # Get user's profile for context
    profile_query = select(Profile).where(Profile.user_id == user_uuid)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    # Build user context
    user_context = {}
    if profile:
        user_context = {
            "target_role": profile.target_role,
            "experience_level": profile.experience_level,
            "interests": profile.interests,
        }
        
        # Get user's skills
        user_skills_query = (
            select(UserSkill)
            .options(selectinload(UserSkill.skill))
            .join(Skill)
            .where(UserSkill.profile_id == profile.id)
        )
        user_skills_result = await db.execute(user_skills_query)
        user_skills = user_skills_result.scalars().all()
        
        user_context["current_skills"] = [us.skill.name for us in user_skills]
    
    # Get AI advice
    try:
        ai_service = GroqService()
        answer = ai_service.generate_career_advice(
            question=request.question,
            user_context=user_context if user_context else None,
        )
        
        return CareerAdviceResponse(
            question=request.question,
            answer=answer,
            timestamp=datetime.utcnow(),
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get career advice: {str(e)}",
        )
