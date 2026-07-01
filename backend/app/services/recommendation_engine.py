"""Recommendation engine service."""

from typing import List, Dict, Optional


# Career paths database - defines required skills for different roles
CAREER_PATHS = {
    "AI Engineer": {
        "required_skills": [
            "Python", "Machine Learning", "Deep Learning", "NLP",
            "TensorFlow", "PyTorch", "LangChain", "OpenAI API"
        ],
        "recommended_skills": [
            "Computer Vision", "Scikit-learn", "Docker", "FastAPI",
            "PostgreSQL", "Git"
        ],
        "description": "Build AI-powered applications and machine learning models",
        "priority": "high"
    },
    "Full Stack Developer": {
        "required_skills": [
            "JavaScript", "React", "Node.js", "Python", "PostgreSQL",
            "REST API", "Git"
        ],
        "recommended_skills": [
            "TypeScript", "Next.js", "Docker", "MongoDB", "Redis",
            "Tailwind CSS", "CI/CD"
        ],
        "description": "Build complete web applications (frontend + backend)",
        "priority": "high"
    },
    "Backend Developer": {
        "required_skills": [
            "Python", "FastAPI", "PostgreSQL", "REST API", "Git",
            "Docker"
        ],
        "recommended_skills": [
            "Django", "Redis", "MongoDB", "CI/CD", "Linux",
            "Microservices", "AWS"
        ],
        "description": "Build server-side applications and APIs",
        "priority": "high"
    },
    "Frontend Developer": {
        "required_skills": [
            "JavaScript", "React", "HTML", "CSS", "Git"
        ],
        "recommended_skills": [
            "TypeScript", "Next.js", "Tailwind CSS", "Vue.js",
            "REST API", "GraphQL"
        ],
        "description": "Build user interfaces and web experiences",
        "priority": "high"
    },
    "Data Scientist": {
        "required_skills": [
            "Python", "Machine Learning", "Scikit-learn", "SQL",
            "NLP", "Statistics"
        ],
        "recommended_skills": [
            "TensorFlow", "PyTorch", "Deep Learning", "Computer Vision",
            "PostgreSQL", "Git"
        ],
        "description": "Analyze data and build predictive models",
        "priority": "high"
    },
    "DevOps Engineer": {
        "required_skills": [
            "Docker", "Kubernetes", "CI/CD", "Linux", "AWS", "Git"
        ],
        "recommended_skills": [
            "Python", "Terraform", "Monitoring", "Microservices",
            "PostgreSQL", "Redis"
        ],
        "description": "Manage infrastructure and deployment pipelines",
        "priority": "high"
    },
    "Mobile Developer": {
        "required_skills": [
            "JavaScript", "React", "REST API", "Git"
        ],
        "recommended_skills": [
            "TypeScript", "Firebase", "Node.js", "MongoDB",
            "Tailwind CSS"
        ],
        "description": "Build mobile applications for iOS and Android",
        "priority": "high"
    },
    "Cloud Engineer": {
        "required_skills": [
            "AWS", "Docker", "Linux", "Python", "Git"
        ],
        "recommended_skills": [
            "Kubernetes", "CI/CD", "Terraform", "Microservices",
            "PostgreSQL", "Monitoring"
        ],
        "description": "Design and manage cloud infrastructure",
        "priority": "high"
    }
}


def analyze_skill_gap(
    user_skills: List[str],
    target_role: str
) -> Dict:
    """
    Analyze skill gap for a target role.
    
    Args:
        user_skills: List of skills user currently has
        target_role: Target career role
    
    Returns:
        Dict with skill gap analysis
    """
    
    if target_role not in CAREER_PATHS:
        return {
            "error": f"Unknown role: {target_role}",
            "available_roles": list(CAREER_PATHS.keys())
        }
    
    career_data = CAREER_PATHS[target_role]
    required_skills = career_data["required_skills"]
    recommended_skills = career_data["recommended_skills"]
    
    # Normalize skills to lowercase for comparison
    user_skills_lower = [s.lower() for s in user_skills]
    required_lower = [s.lower() for s in required_skills]
    recommended_lower = [s.lower() for s in recommended_skills]
    
    # Find missing required skills
    missing_required = [
        s for s in required_skills
        if s.lower() not in user_skills_lower
    ]
    
    # Find missing recommended skills
    missing_recommended = [
        s for s in recommended_skills
        if s.lower() not in user_skills_lower
    ]
    
    # Calculate match percentage
    matched_skills = len(required_skills) - len(missing_required)
    match_percentage = (matched_skills / len(required_skills)) * 100
    
    # Generate recommendations
    recommendations = []
    if missing_required:
        recommendations.append(
            f"Focus on learning these required skills: {', '.join(missing_required[:5])}"
        )
    if missing_recommended:
        recommendations.append(
            f"Consider adding these recommended skills: {', '.join(missing_recommended[:3])}"
        )
    if match_percentage >= 80:
        recommendations.append("Great progress! You're almost ready for this role!")
    elif match_percentage >= 50:
        recommendations.append("Good foundation! Keep learning the missing skills.")
    else:
        recommendations.append("Start with the foundational skills first.")
    
    return {
        "target_role": target_role,
        "current_skills_count": len(user_skills),
        "required_skills": required_skills,
        "missing_required_skills": missing_required,
        "missing_recommended_skills": missing_recommended,
        "skill_match_percentage": round(match_percentage, 2),
        "readiness_level": _get_readiness_level(match_percentage),
        "recommendations": recommendations,
        "career_description": career_data["description"]
    }


def _get_readiness_level(percentage: float) -> str:
    """Get readiness level based on skill match percentage."""
    
    if percentage >= 90:
        return "ready"
    elif percentage >= 70:
        return "almost_ready"
    elif percentage >= 50:
        return "in_progress"
    elif percentage >= 30:
        return "beginner"
    else:
        return "just_starting"


def generate_skill_recommendations(
    user_skills: List[str],
    target_role: Optional[str] = None
) -> List[Dict]:
    """
    Generate personalized skill recommendations.
    
    Args:
        user_skills: List of user's current skills
        target_role: Optional target role
    
    Returns:
        List of skill recommendations
    """
    
    recommendations = []
    
    # If target role specified, generate role-specific recommendations
    if target_role and target_role in CAREER_PATHS:
        gap_analysis = analyze_skill_gap(user_skills, target_role)
        
        if "error" not in gap_analysis:
            # Add missing required skills as high priority
            for skill in gap_analysis["missing_required_skills"]:
                recommendations.append({
                    "skill": skill,
                    "priority": "high",
                    "reason": f"Required for {target_role} role",
                    "type": "required"
                })
            
            # Add missing recommended skills as medium priority
            for skill in gap_analysis["missing_recommended_skills"]:
                recommendations.append({
                    "skill": skill,
                    "priority": "medium",
                    "reason": f"Recommended for {target_role} role",
                    "type": "recommended"
                })
    
    # If no target role or want general recommendations
    if not target_role:
        # Suggest popular/valuable skills user doesn't have
        valuable_skills = [
            "Python", "Docker", "Git", "REST API", "PostgreSQL",
            "Machine Learning", "AWS", "CI/CD"
        ]
        
        user_skills_lower = [s.lower() for s in user_skills]
        
        for skill in valuable_skills:
            if skill.lower() not in user_skills_lower:
                recommendations.append({
                    "skill": skill,
                    "priority": "medium",
                    "reason": "Highly valuable skill in the industry",
                    "type": "general"
                })
    
    return recommendations


def suggest_career_paths(
    user_skills: List[str]
) -> List[Dict]:
    """
    Suggest suitable career paths based on user's current skills.
    
    Args:
        user_skills: List of user's current skills
    
    Returns:
        List of suggested career paths with match percentages
    """
    
    user_skills_lower = [s.lower() for s in user_skills]
    suggestions = []
    
    for role, career_data in CAREER_PATHS.items():
        required_skills = career_data["required_skills"]
        required_lower = [s.lower() for s in required_skills]
        
        # Calculate match
        matched = sum(1 for s in required_lower if s in user_skills_lower)
        match_percentage = (matched / len(required_skills)) * 100
        
        # Only suggest if at least 20% match
        if match_percentage >= 20:
            suggestions.append({
                "role": role,
                "match_percentage": round(match_percentage, 2),
                "description": career_data["description"],
                "matched_skills": [
                    s for s in required_skills
                    if s.lower() in user_skills_lower
                ],
                "missing_skills": [
                    s for s in required_skills
                    if s.lower() not in user_skills_lower
                ],
                "readiness_level": _get_readiness_level(match_percentage)
            })
    
    # Sort by match percentage (highest first)
    suggestions.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return suggestions[:5]  # Return top 5 suggestions
