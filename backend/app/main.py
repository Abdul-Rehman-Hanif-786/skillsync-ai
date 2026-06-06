"""Main application entry point."""

from fastapi import FastAPI
from fastapi.security import HTTPBearer

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.skills import router as skills_router
from app.api.resume import router as resume_router

app = FastAPI(
    title="SkillSync AI",
    description="AI-powered career recommendation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add security scheme for Swagger UI
security_scheme = HTTPBearer()
app.openapi_schema = None

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(skills_router)
app.include_router(resume_router)


@app.get("/")
def home():
    """Health check endpoint."""

    return {
        "message": "SkillSync AI Backend Running"
    }