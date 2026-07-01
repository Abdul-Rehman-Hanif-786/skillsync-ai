"""Dashboard API routes."""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.resume import Resume
from app.models.recommendation import Recommendation
from app.models.roadmap import Roadmap
from app.schemas.dashboard import (
    DashboardStatsResponse,
    ProfileStats,
    SkillStats,
    LearningStats,
    CareerStats,
    ActivityStats,
    ActivityItem,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


async def _get_profile(user_uuid, db):
    result = await db.execute(
        select(Profile).where(Profile.user_id == user_uuid)
    )
    return result.scalar_one_or_none()


async def _get_user_skills(profile_id, db):
    result = await db.execute(
        select(UserSkill)
        .options(selectinload(UserSkill.skill))
        .join(Skill)
        .where(UserSkill.profile_id == profile_id)
    )
    return result.scalars().all()


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full dashboard stats. Works even if profile not created yet."""
    user_uuid = uuid.UUID(current_user["user_id"])
    service = DashboardService()

    profile = await _get_profile(user_uuid, db)
    user_skills = []
    roadmaps = []

    if profile:
        user_skills = await _get_user_skills(profile.id, db)

        roadmaps_result = await db.execute(
            select(Roadmap).where(Roadmap.user_id == user_uuid)
        )
        roadmaps = roadmaps_result.scalars().all()

    # Counts always available
    resumes_total = (
        await db.execute(
            select(func.count()).select_from(Resume).where(Resume.user_id == user_uuid)
        )
    ).scalar() or 0

    recs_total = (
        await db.execute(
            select(func.count())
            .select_from(Recommendation)
            .where(Recommendation.user_id == user_uuid)
        )
    ).scalar() or 0

    return DashboardStatsResponse(
        profile=(
            await service.get_profile_stats(profile)
            if profile
            else ProfileStats(profile_completion=0)
        ),
        skills=await service.get_skill_stats(user_skills),
        learning=(
            await service.get_learning_stats(profile, roadmaps)
            if profile
            else LearningStats()
        ),
        career=(
            await service.get_career_stats(profile, user_skills)
            if profile
            else CareerStats()
        ),
        total_recommendations=recs_total,
        total_resumes=resumes_total,
        last_updated=datetime.utcnow(),
    )


@router.get("/activity", response_model=ActivityStats)
async def get_recent_activity(
    limit: int = 10,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get recent activity feed."""
    user_uuid = uuid.UUID(current_user["user_id"])
    activities = []

    resumes = (
        await db.execute(
            select(Resume)
            .where(Resume.user_id == user_uuid)
            .order_by(Resume.created_at.desc())
            .limit(5)
        )
    ).scalars().all()

    for r in resumes:
        activities.append(ActivityItem(
            type="resume_uploaded",
            title=f"Uploaded resume: {r.original_filename}",
            timestamp=r.created_at or datetime.utcnow(),
            icon="document",
        ))

    recs = (
        await db.execute(
            select(Recommendation)
            .where(Recommendation.user_id == user_uuid)
            .order_by(Recommendation.created_at.desc())
            .limit(5)
        )
    ).scalars().all()

    for rec in recs:
        activities.append(ActivityItem(
            type="recommendation",
            title=f"New recommendation: {rec.title}",
            timestamp=rec.created_at or datetime.utcnow(),
            icon="lightbulb",
        ))

    roads = (
        await db.execute(
            select(Roadmap)
            .where(Roadmap.user_id == user_uuid)
            .order_by(Roadmap.created_at.desc())
            .limit(3)
        )
    ).scalars().all()

    for road in roads:
        activities.append(ActivityItem(
            type="roadmap_generated",
            title=f"Generated roadmap: {road.title}",
            timestamp=road.created_at or datetime.utcnow(),
            icon="map",
        ))

    activities.sort(key=lambda x: x.timestamp, reverse=True)
    total = len(activities)

    return ActivityStats(
        activities=activities[:limit],
        total_activities=total,
        has_more=total > limit,
    )


@router.get("/skills")
async def get_skill_analytics(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Skill analytics — returns empty stats if no profile."""
    user_uuid = uuid.UUID(current_user["user_id"])
    service = DashboardService()

    profile = await _get_profile(user_uuid, db)
    if not profile:
        return {"total_skills": 0, "proficiency_distribution": {}, "recent_skills": [], "top_skills": []}

    user_skills = await _get_user_skills(profile.id, db)
    stats = await service.get_skill_stats(user_skills)

    return {
        "total_skills": stats.total_skills,
        "proficiency_distribution": stats.proficiency_distribution,
        "recent_skills": stats.recent_skills,
        "top_skills": stats.top_skills,
    }


@router.get("/career")
async def get_career_readiness(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Career readiness — returns defaults if no profile."""
    user_uuid = uuid.UUID(current_user["user_id"])
    service = DashboardService()

    profile = await _get_profile(user_uuid, db)
    if not profile:
        return CareerStats()

    user_skills = await _get_user_skills(profile.id, db)
    return await service.get_career_stats(profile, user_skills)


@router.get("/learning")
async def get_learning_progress(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Learning stats — returns defaults if no profile."""
    user_uuid = uuid.UUID(current_user["user_id"])
    service = DashboardService()

    profile = await _get_profile(user_uuid, db)
    if not profile:
        return LearningStats()

    roadmaps = (
        await db.execute(
            select(Roadmap)
            .where(Roadmap.user_id == user_uuid)
            .order_by(Roadmap.created_at.desc())
        )
    ).scalars().all()

    return await service.get_learning_stats(profile, roadmaps)
