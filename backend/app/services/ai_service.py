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
    
    def generate_career_advice(
        self,
        question: str,
        user_context: Optional[Dict] = None,
    ) -> str:
        """Get AI-powered career advice."""

        context_parts = []
        if user_context:
            if user_context.get("target_role"):
                context_parts.append(f"target={user_context['target_role']}")
            if user_context.get("experience_level"):
                context_parts.append(f"level={user_context['experience_level']}")
            if user_context.get("current_skills"):
                skills = user_context["current_skills"][:6]
                context_parts.append(f"skills={','.join(skills)}")

        context_line = f"[Context: {' | '.join(context_parts)}]\n" if context_parts else ""

        system_prompt = """You are SkillSync AI — a sharp career advisor for tech professionals.

RESPONSE STYLE:
- Default: 2-4 sentences MAX. Direct, no fluff.
- If user says "in detail" / "more detail" / "explain": give 5-8 sentences or a short list
- If user says "in points": use 4-6 bullet points, each 1 line
- If user says "step by step": numbered steps, each 1-2 lines
- If user asks "~N words / almost N words": match that word count closely
- NEVER repeat the user's skills list back to them unless directly asked
- NEVER say "As a mid-level developer..." or "Based on your profile..."
- NEVER add "Great question!", "I hope this helps", "Feel free to ask"
- Answer like a knowledgeable friend texting back
- End EVERY response with one concrete action the user can do TODAY (max 15 words)"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": f"{context_line}{question}"},
                ],
                temperature=0.55,
                max_tokens=500,
            )
            return response.choices[0].message.content

        except Exception as e:
            raise Exception(f"Failed to get career advice: {str(e)}")
