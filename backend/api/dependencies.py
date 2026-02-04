import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from backend.database import get_session
from backend.models.user import User

DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
REALM = os.getenv("KEYCLOAK_REALM", "myrealm")

# The OIDC discovery URL for your Keycloak realm
JWKS_URL = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"


def get_mock_token():
    return "dev-token"


if not DEV_MODE:
    oauth2_scheme = OAuth2PasswordBearer(
        tokenUrl=f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token"
    )
else:
    oauth2_scheme = get_mock_token


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)
) -> User:
    if DEV_MODE:
        identity_id, email = "local-dev-user", "dev@localhost"
    else:
        try:
            # 1. Fetch Keycloak public keys automatically
            jwks_client = jwt.PyJWKClient(JWKS_URL)
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            # 2. Decode and validate the token
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience="account",  # Or your specific Client ID
            )
            identity_id = payload.get("sub")
            email = payload.get("email")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication credentials: {str(e)}",
            )

    # 3. DB Lookup / Auto-provisioning
    statement = select(User).where(User.identity_id == identity_id)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    if not user:
        user = User(identity_id=identity_id, email=email, username="NewUser")
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return user
