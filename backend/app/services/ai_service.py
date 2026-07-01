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
        """
        Get AI-powered career advice.
        
        Args:
            question: User's question
            user_context: Optional context about user
        
        Returns:
            AI-generated advice
        """
        
        context_str = ""
        if user_context:
            context_str = f"\n\nUSER CONTEXT:\n{json.dumps(user_context, indent=2)}"
        
        prompt = f"""
You are an expert career advisor specializing in tech careers.

{context_str}

USER QUESTION:
{question}

Please provide a detailed, helpful, and actionable response.
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful career advisor. "
                            "Provide specific, actionable advice for tech professionals."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            raise Exception(f"Failed to get career advice: {str(e)}")
