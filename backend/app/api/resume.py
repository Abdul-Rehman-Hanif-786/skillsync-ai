"""Resume API routes."""

import os
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.resume import Resume
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.schemas.resume import ResumeResponse, ResumeUploadResponse
from app.services.resume_parser import (
    extract_text_from_pdf,
    extract_skills_from_text,
)

router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)

# Create uploads directory if it doesn't exist
UPLOADS_DIR = "uploads/resumes"
os.makedirs(UPLOADS_DIR, exist_ok=True)


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload resume PDF and extract skills.
    
    - Accepts PDF files only
    - Extracts text from PDF
    - Matches skills with known skills database
    - Auto-adds extracted skills to user profile
    """
    
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )
    
    # Validate file size (max 10MB)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10MB",
        )
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    # Generate unique filename
    file_extension = ".pdf"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        
        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Please ensure it's a valid resume.",
            )
        
        # Get all known skills from database
        skills_query = select(Skill.name)
        skills_result = await db.execute(skills_query)
        known_skills = [row[0] for row in skills_result.all()]
        
        # Extract skills from resume
        extracted_skills = extract_skills_from_text(extracted_text, known_skills)
        
        # Create resume record
        resume = Resume(
            user_id=user_uuid,
            filename=file.filename,
            file_path=file_path,
            extracted_text=extracted_text,
            extracted_skills=extracted_skills,
            parsing_status="completed",
        )
        
        db.add(resume)
        await db.commit()
        await db.refresh(resume)
        
        # Auto-add extracted skills to user profile
        skills_added = 0
        
        if extracted_skills:
            # Get user's profile
            profile_query = select(Profile).where(Profile.user_id == user_uuid)
            profile_result = await db.execute(profile_query)
            profile = profile_result.scalar_one_or_none()
            
            if profile:
                # Get existing skill IDs for this profile
                existing_skills_query = select(UserSkill.skill_id).where(
                    UserSkill.profile_id == profile.id
                )
                existing_result = await db.execute(existing_skills_query)
                existing_skill_ids = set([row[0] for row in existing_result.all()])
                
                # Add new skills
                for skill_data in extracted_skills:
                    skill_name = skill_data["name"]
                    
                    # Get skill from database
                    skill_query = select(Skill).where(Skill.name == skill_name)
                    skill_result = await db.execute(skill_query)
                    skill = skill_result.scalar_one_or_none()
                    
                    if skill and skill.id not in existing_skill_ids:
                        # Add skill to profile
                        user_skill = UserSkill(
                            profile_id=profile.id,
                            skill_id=skill.id,
                            proficiency_level="unknown",
                        )
                        
                        db.add(user_skill)
                        skills_added += 1
                
                await db.commit()
        
        return ResumeUploadResponse(
            message=f"Resume uploaded successfully! {skills_added} skills extracted and added to your profile.",
            resume=ResumeResponse(
                id=str(resume.id),
                filename=resume.filename,
                extracted_text=resume.extracted_text[:500] if resume.extracted_text else None,  # Limit text
                extracted_skills=resume.extracted_skills,
                parsing_status=resume.parsing_status,
                created_at=resume.created_at,
            ),
            extracted_skills_count=skills_added,
        )
    
    except HTTPException:
        raise
    
    except Exception as e:
        # Clean up uploaded file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process resume: {str(e)}",
        )


@router.get("/latest", response_model=ResumeResponse)
async def get_latest_resume(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's latest uploaded resume."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = (
        select(Resume)
        .where(Resume.user_id == user_uuid)
        .order_by(Resume.created_at.desc())
    )
    
    result = await db.execute(query)
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=404,
            detail="No resume found. Please upload a resume first.",
        )
    
    return ResumeResponse(
        id=str(resume.id),
        filename=resume.filename,
        extracted_text=resume.extracted_text,
        extracted_skills=resume.extracted_skills,
        parsing_status=resume.parsing_status,
        created_at=resume.created_at,
    )


@router.get("/history", response_model=list[ResumeResponse])
async def get_resume_history(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all uploaded resumes for current user."""
    
    user_uuid = uuid.UUID(current_user["user_id"])
    
    query = (
        select(Resume)
        .where(Resume.user_id == user_uuid)
        .order_by(Resume.created_at.desc())
    )
    
    result = await db.execute(query)
    resumes = result.scalars().all()
    
    return [
        ResumeResponse(
            id=str(resume.id),
            filename=resume.filename,
            extracted_text=resume.extracted_text[:200] if resume.extracted_text else None,
            extracted_skills=resume.extracted_skills,
            parsing_status=resume.parsing_status,
            created_at=resume.created_at,
        )
        for resume in resumes
    ]
