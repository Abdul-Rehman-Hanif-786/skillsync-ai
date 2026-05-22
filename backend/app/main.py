"""Main application entry point."""

from fastapi import FastAPI

app = FastAPI(
    title="SkillSync AI",
    description="AI-powered career recommendation platform",
    version="1.0.0",
)


@app.get("/")
def home():
    """Health check endpoint."""
    return {"message": "SkillSync AI Backend Running"}
    