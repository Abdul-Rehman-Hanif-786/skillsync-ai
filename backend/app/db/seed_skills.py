"""Seed database with initial skills."""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.skill import Skill


async def seed_skills():
    """Add default skills to database."""
    
    # Get database session
    db_generator = get_db()
    db = await db_generator.__anext__()
    
    try:
        # List of common tech skills with categories
        skills_data = [
            # Programming Languages
            {"name": "Python", "category": "Programming Language", "description": "General-purpose programming language"},
            {"name": "JavaScript", "category": "Programming Language", "description": "Web programming language"},
            {"name": "TypeScript", "category": "Programming Language", "description": "Typed JavaScript"},
            {"name": "Java", "category": "Programming Language", "description": "Object-oriented programming language"},
            {"name": "C++", "category": "Programming Language", "description": "Systems programming language"},
            {"name": "Go", "category": "Programming Language", "description": "Google's programming language"},
            {"name": "Rust", "category": "Programming Language", "description": "Systems programming with memory safety"},
            
            # Frontend
            {"name": "React", "category": "Frontend", "description": "JavaScript UI library"},
            {"name": "Vue.js", "category": "Frontend", "description": "Progressive JavaScript framework"},
            {"name": "Angular", "category": "Frontend", "description": "TypeScript-based framework"},
            {"name": "Next.js", "category": "Frontend", "description": "React framework"},
            {"name": "Tailwind CSS", "category": "Frontend", "description": "Utility-first CSS framework"},
            {"name": "HTML", "category": "Frontend", "description": "Markup language"},
            {"name": "CSS", "category": "Frontend", "description": "Styling language"},
            
            # Backend
            {"name": "FastAPI", "category": "Backend", "description": "Python web framework"},
            {"name": "Django", "category": "Backend", "description": "Python web framework"},
            {"name": "Flask", "category": "Backend", "description": "Python micro framework"},
            {"name": "Node.js", "category": "Backend", "description": "JavaScript runtime"},
            {"name": "Express.js", "category": "Backend", "description": "Node.js web framework"},
            {"name": "Spring Boot", "category": "Backend", "description": "Java framework"},
            
            # Database
            {"name": "PostgreSQL", "category": "Database", "description": "Relational database"},
            {"name": "MySQL", "category": "Database", "description": "Relational database"},
            {"name": "MongoDB", "category": "Database", "description": "NoSQL database"},
            {"name": "Redis", "category": "Database", "description": "In-memory data store"},
            {"name": "SQL", "category": "Database", "description": "Query language"},
            
            # DevOps
            {"name": "Docker", "category": "DevOps", "description": "Containerization platform"},
            {"name": "Kubernetes", "category": "DevOps", "description": "Container orchestration"},
            {"name": "CI/CD", "category": "DevOps", "description": "Continuous integration/deployment"},
            {"name": "Git", "category": "DevOps", "description": "Version control system"},
            {"name": "AWS", "category": "DevOps", "description": "Amazon Web Services"},
            {"name": "Linux", "category": "DevOps", "description": "Operating system"},
            
            # AI/ML
            {"name": "Machine Learning", "category": "AI/ML", "description": "AI subset"},
            {"name": "Deep Learning", "category": "AI/ML", "description": "Neural networks"},
            {"name": "LangChain", "category": "AI/ML", "description": "LLM framework"},
            {"name": "OpenAI API", "category": "AI/ML", "description": "GPT models API"},
            {"name": "TensorFlow", "category": "AI/ML", "description": "ML framework"},
            {"name": "PyTorch", "category": "AI/ML", "description": "ML framework"},
            {"name": "Scikit-learn", "category": "AI/ML", "description": "ML library"},
            {"name": "NLP", "category": "AI/ML", "description": "Natural language processing"},
            {"name": "Computer Vision", "category": "AI/ML", "description": "Image processing AI"},
            
            # Tools & Others
            {"name": "REST API", "category": "Tools", "description": "API architecture"},
            {"name": "GraphQL", "category": "Tools", "description": "Query language for APIs"},
            {"name": "Microservices", "category": "Tools", "description": "Architecture pattern"},
            {"name": "Agile", "category": "Tools", "description": "Development methodology"},
            {"name": "Testing", "category": "Tools", "description": "Software testing"},
        ]
        
        # Check and add each skill
        for skill_data in skills_data:
            query = select(Skill).where(Skill.name == skill_data["name"])
            result = await db.execute(query)
            existing = result.scalar_one_or_none()
            
            if not existing:
                skill = Skill(**skill_data)
                db.add(skill)
                print(f"✓ Added skill: {skill_data['name']}")
            else:
                print(f"- Skill already exists: {skill_data['name']}")
        
        await db.commit()
        print(f"\n✅ Successfully seeded skills database!")
        
    except Exception as e:
        await db.rollback()
        print(f"❌ Error seeding skills: {e}")
        raise
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(seed_skills())
