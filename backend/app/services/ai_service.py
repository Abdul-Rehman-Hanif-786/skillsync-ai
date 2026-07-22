"""AI service using Groq API for roadmap generation."""

import json
from typing import List, Dict, Optional
from groq import Groq

from app.core.config import settings


class GroqService:
    """Service for interacting with Groq API."""
    
    def __init__(self):
        """Initialize Groq client."""
        if not settings.GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY not set in environment variables. "
                "Get your API key from https://console.groq.com"
            )
        
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
    
    def generate_learning_roadmap(
        self,
        current_skills: List[str],
        target_role: str,
        experience_level: str = "beginner",
        interests: Optional[List[str]] = None,
    ) -> Dict:
        """
        Generate personalized learning roadmap using AI.
        
        Args:
            current_skills: User's current skills
            target_role: Target career role
            experience_level: Experience level
            interests: User's interests
        
        Returns:
            Dict containing roadmap with steps, timeline, and resources
        """
        
        # Create prompt for AI
        prompt = self._create_roadmap_prompt(
            current_skills,
            target_role,
            experience_level,
            interests,
        )
        
        try:
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert career advisor and learning path designer. "
                            "Create detailed, actionable learning roadmaps for tech professionals. "
                            "Always respond with valid JSON."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000,
                response_format={"type": "json_object"},
            )
            
            # Parse response
            roadmap_text = response.choices[0].message.content
            roadmap_data = json.loads(roadmap_text)
            
            return roadmap_data
        
        except Exception as e:
            raise Exception(f"Failed to generate roadmap: {str(e)}")
    
    def _create_roadmap_prompt(
        self,
        current_skills: List[str],
        target_role: str,
        experience_level: str,
        interests: Optional[List[str]] = None,
    ) -> str:
        """Create prompt for roadmap generation."""
        
        skills_str = ", ".join(current_skills) if current_skills else "None"
        interests_str = ", ".join(interests) if interests else "None"
        
        prompt = f"""
Create a detailed learning roadmap for someone who wants to become a {target_role}.

CURRENT PROFILE:
- Experience Level: {experience_level}
- Current Skills: {skills_str}
- Interests: {interests_str}
- Target Role: {target_role}

Please provide a comprehensive roadmap in JSON format with the following structure:

{{
  "title": "Roadmap to Become a {target_role}",
  "description": "Brief overview of the roadmap",
  "duration_months": 12,
  "phases": [
    {{
      "phase_number": 1,
      "title": "Phase Name",
      "duration": "2 months",
      "description": "What to learn in this phase",
      "topics": [
        {{
          "topic": "Specific topic/skill to learn",
          "description": "Why this is important",
          "estimated_hours": 40,
          "resources": [
            {{
              "title": "Resource name",
              "type": "course|book|tutorial|documentation",
              "url": "https://example.com",
              "description": "What this resource covers"
            }}
          ],
          "projects": [
            {{
              "title": "Project name",
              "description": "What to build",
              "difficulty": "beginner|intermediate|advanced"
            }}
          ]
        }}
      ],
      "milestones": ["Milestone 1", "Milestone 2"]
    }}
  ],
  "tips": [
    "General learning tips",
    "Best practices"
  ],
  "estimated_total_hours": 1000
}}

IMPORTANT GUIDELINES:
1. Make it realistic and achievable
2. Progress from basics to advanced gradually
3. Include hands-on projects in each phase
4. Suggest free resources when possible
5. Consider the user's current skills (don't repeat what they already know)
6. Focus on practical, job-ready skills
7. Include both theoretical learning and practical application
8. Provide specific, actionable steps
9. Make sure the JSON is valid and properly formatted

Generate the roadmap now:
"""
        
        return prompt
    
    def estimate_skill_proficiency(
        self,
        resume_text: str,
        skills: list,
    ) -> dict:
        """
        Use AI to estimate proficiency level for each skill based on resume text.
        Returns dict: {skill_name: proficiency_level}
        """
        if not skills:
            return {}

        skills_str = ', '.join(skills[:20])  # limit to avoid token overflow

        prompt = f"""Analyze this resume text and estimate the proficiency level for each skill listed.

SKILLS TO EVALUATE: {skills_str}

RESUME TEXT:
{resume_text[:3000]}

For each skill, determine proficiency based on:
- "expert": 5+ years, led teams, built complex systems with this skill
- "advanced": 3-5 years, strong hands-on experience, can mentor others
- "intermediate": 1-3 years, working knowledge, used in real projects
- "beginner": <1 year, basic understanding, learning or just started

Respond ONLY with valid JSON like this:
{{
  "Python": "advanced",
  "React": "intermediate",
  "Docker": "beginner"
}}

Only include skills from the list above. Use exactly these values: expert, advanced, intermediate, beginner."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a resume analyzer. Respond only with valid JSON."},
                    {"role": "user",   "content": prompt},
                ],
                temperature=0.3,
                max_tokens=400,
                response_format={"type": "json_object"},
            )
            import json
            result = json.loads(response.choices[0].message.content)
            # Validate values
            valid = {"expert", "advanced", "intermediate", "beginner"}
            return {k: v for k, v in result.items() if v in valid}
        except Exception:
            return {}

    def generate_career_advice(
        self,
        question: str,
        user_context: Optional[Dict] = None,
    ) -> str:
        """Get AI-powered career advice with structured, detailed responses."""

        context_parts = []
        if user_context:
            if user_context.get("target_role"):
                context_parts.append(f"Target: {user_context['target_role']}")
            if user_context.get("experience_level"):
                context_parts.append(f"Level: {user_context['experience_level']}")
            if user_context.get("current_skills"):
                skills = user_context["current_skills"][:8]
                context_parts.append(f"Skills: {', '.join(skills)}")

        context_line = f"[User Profile: {' | '.join(context_parts)}]\n\n" if context_parts else ""

        system_prompt = """You are SkillSync AI — an expert career advisor for tech professionals. You give accurate, detailed, well-structured answers.

## RESPONSE FORMAT:
- Use **bold** for key terms, role names, skill names, salaries
- Use bullet points for lists (- item)
- Use numbered lists for steps or rankings (1. 2. 3.)
- Add ## section headers for longer responses
- Default response: 100-200 words with clear structure
- For "brief/short" questions: 50-80 words
- For "detailed/in depth" questions: 300-500 words with full sections

## CONTENT STANDARDS:
- Give accurate, specific answers with real numbers (salaries, timeframes, versions)
- Always end with **Next Step:** one concrete action
- Never say "Great question!" or "I hope this helps"
- Never repeat the user's skills list unless specifically asked
- Be direct and confident — no vague hedging
- Cover: career paths, skills, salaries, interviews, growth, trends, remote work

## EXAMPLE STRUCTURE for a skill question:
**[Skill Name]** is [brief definition].

**Why learn it:**
- Reason 1
- Reason 2

**Salary impact:** $X - $Y range
**Time to learn:** X months

**Next Step:** [specific action]"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": f"{context_line}{question}"},
                ],
                temperature=0.65,
                max_tokens=800,
            )
            return response.choices[0].message.content

        except Exception as e:
            raise Exception(f"Failed to get career advice: {str(e)}")
