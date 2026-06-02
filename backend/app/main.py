"""Main application entry point."""

from fastapi import FastAPI

from app.api.auth import router as auth_router

app = FastAPI(
    title="SkillSync AI",
    description="AI-powered career recommendation platform",
    version="1.0.0",
)

app.include_router(auth_router)


@app.get("/")
def home():
    """Health check endpoint."""

    return {
        "message": "SkillSync AI Backend Running"
    }