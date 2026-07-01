"""Recommendation API routes."""

import uuid
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
from app.models.recommendation import Recommendation
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationGenerateRequest,
    SkillGapAnalysis,
)
from app.services.recommendation_engine import (
    analyze_skill_gap,
    generate_skill_recommendations,
    suggest_career_paths,
    CAREER_PATHS,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.post("/generate", response_model=List[RecommendationResponse])
async def generate_recommendations(
    request: RecommendationGenerateRequest = RecommendationGenerateRequest(),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate personalized recommendations for the user.
    
    - Analyzes user's current skills
    - Generates skill gap analysis
    - Creates personalized recommendations
    - Saves recommendations to database
    """
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    # Get user's profile and skills
    profile_query = select(Profile).where(Profile.user_id == user_uuid)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first.",
        )
    
    # Get user's skills with eager loading
    user_skills_query = (
        select(UserSkill)
        .options(selectinload(UserSkill.skill))
        .join(Skill)
        .where(UserSkill.profile_id == profile.id)
    )
    user_skills_result = await db.execute(user_skills_query)
    user_skills = user_skills_result.scalars().all()
    skill_names = [us.skill.name for us in user_skills]
    
    # Determine target role
    target_role = request.target_role or (profile.target_role if profile else None)
    generate_type = request.generate_type or "all"
    
    generated_recommendations = []
    
    # Generate skill recommendations
    if generate_type in ["all", "skills"]:
        skill_recs = generate_skill_recommendations(skill_names, target_role)
        
        for rec in skill_recs:
            recommendation = Recommendation(
                user_id=user_uuid,
                recommendation_type="skill",
                title=f"Learn {rec['skill']}",
                description=f"Add {rec['skill']} to your skill set",
                recommended_skills=[{"name": rec['skill']}],
                priority=rec['priority'],
                reason=rec['reason'],
                extra_data={"type": rec['type']},
            )
            
            db.add(recommendation)
            generated_recommendations.append(recommendation)
    
    # Generate career path recommendations
    if generate_type in ["all", "career"]:
        if target_role:
            # Generate specific career path recommendation
            gap_analysis = analyze_skill_gap(skill_names, target_role)
            
            if "error" not in gap_analysis:
                career_rec = Recommendation(
                    user_id=user_uuid,
                    recommendation_type="career_path",
                    title=f"{target_role} Career Path",
                    description=gap_analysis.get("career_description", ""),
                    recommended_skills=[
                        {"name": s, "priority": "required"}
                        for s in gap_analysis.get("missing_required_skills", [])
                    ],
                    priority="high",
                    reason=f"Skills needed for {target_role} role",
                    extra_data={
                        "gap_analysis": gap_analysis,
                        "target_role": target_role
                    },
                )
                
                db.add(career_rec)
                generated_recommendations.append(career_rec)
    
    await db.commit()
    
    # Refresh all recommendations to get IDs
    for rec in generated_recommendations:
        await db.refresh(rec)
    
    return generated_recommendations


@router.get("/", response_model=List[RecommendationResponse])
async def get_recommendations(
    recommendation_type: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's recommendations with optional filtering."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = (
        select(Recommendation)
        .where(Recommendation.user_id == user_uuid)
        .order_by(Recommendation.created_at.desc())
    )
    
    if recommendation_type:
        query = query.where(Recommendation.recommendation_type == recommendation_type)
    
    result = await db.execute(query)
    recommendations = result.scalars().all()
    
    return recommendations


@router.get("/skill-gap", response_model=dict)
async def get_skill_gap_analysis(
    target_role: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get skill gap analysis for a target role.
    
    Shows what skills you have vs what you need.
    """
    
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
    
    # Determine target role
    if not target_role:
        target_role = profile.target_role
    
    if not target_role:
        raise HTTPException(
            status_code=400,
            detail="No target role specified. Set it in your profile or provide it as a parameter.",
        )
    
    # Get user's skills with eager loading
    user_skills_query = (
        select(UserSkill)
        .options(selectinload(UserSkill.skill))
        .join(Skill)
        .where(UserSkill.profile_id == profile.id)
    )
    user_skills_result = await db.execute(user_skills_query)
    user_skills = user_skills_result.scalars().all()
    
    skill_names = [us.skill.name for us in user_skills]
    
    # Perform gap analysis
    gap_analysis = analyze_skill_gap(skill_names, target_role)
    
    return gap_analysis


@router.get("/career-suggestions", response_model=List[dict])
async def get_career_suggestions(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get suggested career paths based on current skills.
    
    Analyzes your skills and suggests suitable roles.
    """
    
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
    
    # Get user's skills with eager loading
    user_skills_query = (
        select(UserSkill)
        .options(selectinload(UserSkill.skill))
        .join(Skill)
        .where(UserSkill.profile_id == profile.id)
    )
    user_skills_result = await db.execute(user_skills_query)
    user_skills = user_skills_result.scalars().all()
    
    skill_names = [us.skill.name for us in user_skills]
    
    # Get career suggestions
    suggestions = suggest_career_paths(skill_names)
    
    return suggestions


@router.get("/available-roles", response_model=List[str])
async def get_available_roles():
    """Get list of all available career roles for recommendations."""
    
    return list(CAREER_PATHS.keys())


@router.delete("/{recommendation_id}")
async def delete_recommendation(
    recommendation_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a specific recommendation."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = select(Recommendation).where(
        Recommendation.id == uuid.UUID(recommendation_id),
        Recommendation.user_id == user_uuid,
    )
    
    result = await db.execute(query)
    recommendation = result.scalar_one_or_none()
    
    if not recommendation:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found",
        )
    
    await db.delete(recommendation)
    await db.commit()
    
    return {"message": "Recommendation deleted successfully"}
