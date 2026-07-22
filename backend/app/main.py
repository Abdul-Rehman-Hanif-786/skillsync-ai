"""Main application entry point."""

import os
from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.skills import router as skills_router
from app.api.resume import router as resume_router
from app.api.recommendations import router as recommendations_router
from app.api.roadmap import router as roadmap_router
from app.api.dashboard import router as dashboard_router

import os

app = FastAPI(
    title="SkillSync AI",
    description="AI-powered career recommendation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend origins
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security scheme for Swagger UI
security_scheme = HTTPBearer()
app.openapi_schema = None

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(skills_router)
app.include_router(resume_router)
app.include_router(recommendations_router)
app.include_router(roadmap_router)
app.include_router(dashboard_router)


@app.get("/")
def home():
    """Health check endpoint."""

    return {
        "message": "SkillSync AI Backend Running"
    }