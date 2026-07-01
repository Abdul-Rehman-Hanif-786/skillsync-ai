"""Authentication routes."""

import secrets
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

RESET_TOKEN_EXPIRE_MINUTES = 30


# ── Me (get current user) ─────────────────────────────────────────────────
@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the logged-in user's info."""
    result = await db.execute(
        select(User).where(User.id == __import__('uuid').UUID(current_user["user_id"]))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
    }


# ── Register ──────────────────────────────────────────────────────────────
@router.post("/register")
async def register_user(user_data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    return {
        "message": "User registered successfully",
        "user": {"id": str(new_user.id), "email": new_user.email, "full_name": new_user.full_name},
        "access_token": access_token,
        "token_type": "bearer",
    }


# ── Login ─────────────────────────────────────────────────────────────────
@router.post("/login")
async def login_user(user_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": str(user.id), "email": user.email, "full_name": user.full_name},
    }


# ── Forgot Password ───────────────────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a password reset token.
    In production, this would send an email.
    In development, the token is returned directly.
    """
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    # Always return 200 to prevent email enumeration
    if not user:
        return {
            "message": "If this email exists, a reset link has been sent.",
            "dev_token": None,
            "dev_reset_url": None,
        }

    # Generate secure token
    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    user.reset_token = token
    user.reset_token_expiry = expiry
    await db.commit()

    # In production: send email here
    # For dev: return token in response
    reset_url = f"http://localhost:5173/reset-password?token={token}"

    return {
        "message": "If this email exists, a reset link has been sent.",
        "dev_token": token,          # Remove in production
        "dev_reset_url": reset_url,  # Remove in production
        "expires_in_minutes": RESET_TOKEN_EXPIRE_MINUTES,
    }


# ── Reset Password ────────────────────────────────────────────────────────
@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using token."""
    result = await db.execute(select(User).where(User.reset_token == data.token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if not user.reset_token_expiry or datetime.utcnow() > user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Reset token has expired. Request a new one.")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    # Update password and clear token
    user.password_hash     = hash_password(data.new_password)
    user.reset_token       = None
    user.reset_token_expiry= None
    await db.commit()

    return {"message": "Password reset successfully. You can now log in."}


# ── Verify Token (optional check) ────────────────────────────────────────
@router.get("/verify-reset-token")
async def verify_reset_token(token: str, db: AsyncSession = Depends(get_db)):
    """Check if a reset token is valid and not expired."""
    result = await db.execute(select(User).where(User.reset_token == token))
    user = result.scalar_one_or_none()

    if not user or not user.reset_token_expiry or datetime.utcnow() > user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    return {"valid": True, "email": user.email}
