"""Authentication routes."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.db.session import get_db

from app.models.user import User

from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register")
async def register_user(
    user_data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register new user."""

    query = select(User).where(
        User.email == user_data.email
    )

    result = await db.execute(query)

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    hashed_password = hash_password(
        user_data.password
    )

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed_password,
    )

    db.add(new_user)

    await db.commit()

    await db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login_user(
    user_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login user."""

    query = select(User).where(
        User.email == user_data.email
    )

    result = await db.execute(query)

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    is_valid_password = verify_password(
        user_data.password,
        user.password_hash,
    )

    if not is_valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
    