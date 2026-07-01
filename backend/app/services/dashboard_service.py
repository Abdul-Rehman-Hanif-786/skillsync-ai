"""Dashboard service - calculates all dashboard statistics."""

from typing import List, Optional, Dict
from datetime import datetime

from app.models.profile import Profile
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.roadmap import Roadmap
from app.schemas.dashboard import (
    ProfileStats,
    SkillStats,
    LearningStats,
    CareerStats,
)


class DashboardService:
    """Service to calculate dashboard statistics."""

    async def get_profile_stats(self, profile: Profile) -> ProfileStats:
        """Calculate profile completion percentage."""

        # Fields that contribute to completion
        completion_fields = {
            'bio': profile.bio,
            'github_url': profile.github_url,
            'linkedin_url': profile.linkedin_url,
            'experience_level': profile.experience_level,
            'target_role': profile.target_role,
            'interests': profile.interests,
        }

        # Count filled fields
        filled = sum(1 for v in completion_fields.values() if v)
        completion = (filled / len(completion_fields)) * 100

        return ProfileStats(
            profile_completion=round(completion, 2),
            target_role=profile.target_role,
            experience_level=profile.experience_level,
            has_bio=bool(profile.bio),
            has_github=bool(profile.github_url),
            has_linkedin=bool(profile.linkedin_url),
        )

    async def get_skill_stats(
        self,
        user_skills: List[UserSkill]
    ) -> SkillStats:
        """Analyze user's skills."""

        if not user_skills:
            return SkillStats(total_skills=0)

        # Proficiency distribution
        proficiency_dist = {}
        for us in user_skills:
            level = us.proficiency_level or 'unknown'
            proficiency_dist[level] = proficiency_dist.get(level, 0) + 1

        # Recent skills (last 5)
        sorted_skills = sorted(
            user_skills,
            key=lambda x: x.created_at if x.created_at else datetime.min,
            reverse=True
        )
        recent = sorted_skills[:5]

        recent_skills = [
            {
                "name": us.skill.name,
                "proficiency_level": us.proficiency_level,
                "added_at": us.created_at.isoformat() if us.created_at else None,
            }
            for us in recent
        ]

        # Top skills (by proficiency)
        proficiency_ranking = {
            'expert': 5,
            'advanced': 4,
            'intermediate': 3,
            'beginner': 2,
            'unknown': 1,
        }

        top_sorted = sorted(
            user_skills,
            key=lambda x: proficiency_ranking.get(x.proficiency_level or 'unknown', 0),
            reverse=True
        )[:5]

        top_skills = [
            {
                "name": us.skill.name,
                "proficiency": us.proficiency_level,
            }
            for us in top_sorted
        ]

        return SkillStats(
            total_skills=len(user_skills),
            proficiency_distribution=proficiency_dist,
            recent_skills=recent_skills,
            top_skills=top_skills,
        )

    async def get_learning_stats(
        self,
        profile: Profile,
        roadmaps: List[Roadmap]
    ) -> LearningStats:
        """Calculate learning progress."""

        if not roadmaps:
            return LearningStats()

        # Count active vs completed
        active_roadmaps = []
        completed_roadmaps = []

        for roadmap in roadmaps:
            steps = roadmap.steps or []
            if not steps:
                active_roadmaps.append(roadmap)
                continue

            # Simple heuristic: if has steps, consider active
            active_roadmaps.append(roadmap)

        # Get current roadmap (most recent)
        current_roadmap = None
        if active_roadmaps:
            latest = max(
                active_roadmaps,
                key=lambda r: r.created_at if r.created_at else datetime.min
            )

            steps = latest.steps or []
            total_phases = len(steps)

            current_roadmap = {
                "id": str(latest.id),
                "title": latest.title,
                "target_role": latest.target_role,
                "total_phases": total_phases,
                "progress_percentage": 0,  # Can be enhanced with tracking
                "created_at": latest.created_at.isoformat() if latest.created_at else None,
            }

        return LearningStats(
            active_roadmaps=len(active_roadmaps),
            completed_roadmaps=len(completed_roadmaps),
            total_roadmaps=len(roadmaps),
            current_roadmap=current_roadmap,
            learning_streak_days=0,  # Can be enhanced with activity tracking
        )

    async def get_career_stats(
        self,
        profile: Profile,
        user_skills: List[UserSkill]
    ) -> CareerStats:
        """Calculate career readiness."""

        if not profile.target_role:
            return CareerStats(
                readiness_level="not_started",
                target_role=None,
            )

        # Get skill names
        skill_names = [us.skill.name for us in user_skills]

        # Use recommendation engine for gap analysis
        try:
            from app.services.recommendation_engine import analyze_skill_gap

            gap_analysis = analyze_skill_gap(skill_names, profile.target_role)

            if "error" in gap_analysis:
                return CareerStats(
                    readiness_level="unknown",
                    target_role=profile.target_role,
                )

            # Strengths (matched skills)
            required_skills = gap_analysis.get("required_skills", [])
            missing_skills = gap_analysis.get("missing_required_skills", [])
            matched = [s for s in required_skills if s not in missing_skills]

            # Next steps
            next_steps = []
            if missing_skills:
                next_steps.append(
                    f"Focus on learning: {', '.join(missing_skills[:3])}"
                )

            readiness = gap_analysis.get("readiness_level", "unknown")
            match_pct = gap_analysis.get("skill_match_percentage", 0)

            return CareerStats(
                readiness_level=readiness,
                skill_match_percentage=round(match_pct, 2),
                total_required_skills=len(required_skills),
                matched_skills=len(matched),
                missing_skills_count=len(missing_skills),
                target_role=profile.target_role,
                strengths=matched[:5],
                next_steps=next_steps,
            )

        except Exception:
            return CareerStats(
                readiness_level="unknown",
                target_role=profile.target_role,
            )
