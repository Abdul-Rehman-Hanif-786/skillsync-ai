"""Initialize database tables."""
import asyncio
from app.db.database import engine
from app.models.base import BaseModel

# Import all models so they register with Base
from app.models.user import User
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.resume import Resume
from app.models.recommendation import Recommendation
from app.models.roadmap import Roadmap


async def init_db():
    """Create all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(BaseModel.metadata.create_all)
    print("[OK] Database tables created successfully!")


if __name__ == "__main__":
    asyncio.run(init_db())
