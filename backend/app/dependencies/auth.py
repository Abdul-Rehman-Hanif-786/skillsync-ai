from jose import JWTError, jwt

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

# Use HTTPBearer for cleaner Swagger UI (shows simple token field)
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token: missing user id",
            )

        return {
            "user_id": user_id,
            "email": email,
        }

    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}",
        )
        