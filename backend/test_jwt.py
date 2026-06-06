"""Test JWT token generation and decoding."""

from jose import jwt
from app.core.config import settings
from app.core.security import create_access_token

# Test 1: Create a token
print("=" * 50)
print("Test 1: Creating JWT Token")
print("=" * 50)

test_data = {
    "sub": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com"
}

token = create_access_token(data=test_data)
print(f"Token generated: {token[:50]}...")
print()

# Test 2: Decode the token
print("=" * 50)
print("Test 2: Decoding JWT Token")
print("=" * 50)

try:
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
    
    print(f"✓ Token decoded successfully!")
    print(f"  - user_id (sub): {payload.get('sub')}")
    print(f"  - email: {payload.get('email')}")
    print(f"  - exp: {payload.get('exp')}")
    print()
    
    # Test 3: Convert string UUID back to UUID
    import uuid
    
    print("=" * 50)
    print("Test 3: UUID Conversion")
    print("=" * 50)
    
    user_id_str = payload.get("sub")
    user_uuid = uuid.UUID(user_id_str)
    
    print(f"✓ String to UUID conversion successful!")
    print(f"  - String: {user_id_str}")
    print(f"  - UUID: {user_uuid}")
    print(f"  - Type: {type(user_uuid)}")
    
except Exception as e:
    print(f"✗ Error: {e}")

print()
print("=" * 50)
print("All tests completed!")
print("=" * 50)
