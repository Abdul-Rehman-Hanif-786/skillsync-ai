"""Authentication schemas."""

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    """User registration request schema."""

    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """User login request schema."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response schema."""

    access_token: str
    token_type: str
    