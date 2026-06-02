"""Database session dependency."""

from app.db.database import async_session_local


async def get_db():
    """Get database session."""

    async with async_session_local() as session:
        yield session
        