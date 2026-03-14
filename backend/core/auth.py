import os
from typing import Any
from urllib.parse import urlencode

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from jwt import decode
from keycloak import KeycloakOpenID
from sqladmin.authentication import AuthenticationBackend
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from backend.database import get_session
from backend.models import User

# --- CONFIGURATION ---
INTERNAL_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080").rstrip("/")
EXTERNAL_URL = "http://localhost:8080"

REDIRECT_URI = os.getenv("KEYCLOAK_REDIRECT_URI", "http://localhost:8000/auth/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

keycloak_openid = KeycloakOpenID(
    server_url=INTERNAL_URL,
    client_id=os.getenv("KEYCLOAK_CLIENT_ID", "knit-app"),
    realm_name=os.getenv("KEYCLOAK_REALM", "knit-realm"),
    client_secret_key=os.getenv("KEYCLOAK_CLIENT_SECRET", ""),
)

# --- SQLADMIN AUTHENTICATION BACKEND ---


class KeycloakAuth(AuthenticationBackend):
    async def login(self, request: Request) -> Any:
        # Bookmark that we are coming from the Admin panel
        request.session["admin_next"] = "/admin"

        auth_url = keycloak_openid.auth_url(redirect_uri=REDIRECT_URI)
        browser_url = str(auth_url).replace(INTERNAL_URL, EXTERNAL_URL)
        return RedirectResponse(browser_url)

    async def authenticate(self, request: Request) -> bool:
        # If this prints empty, the middleware order in main.py is definitely the problem
        token = request.session.get("access_token")

        if not token:
            print(f"DEBUG ADMIN: Empty session on {request.url.path}")
            return False

        try:
            payload = decode(token, options={"verify_signature": False})
            roles = payload.get("realm_access", {}).get("roles", [])
            return "admin" in roles
        except Exception as e:
            print(f"DEBUG ADMIN: Decode failure: {e}")
            return False


# Instance for main.py
authentication_backend = KeycloakAuth(secret_key=os.getenv("SECRET_KEY", "supersecret"))

# --- APP ROUTER ---

auth_router = APIRouter()


@auth_router.get("/auth/login")
async def app_login():
    auth_url = keycloak_openid.auth_url(redirect_uri=REDIRECT_URI)
    browser_url = str(auth_url).replace(INTERNAL_URL, EXTERNAL_URL)
    return RedirectResponse(browser_url)


@auth_router.get("/auth/callback")
async def login_callback(code: str, request: Request):
    try:
        token = keycloak_openid.token(
            grant_type="authorization_code",
            code=code,
            redirect_uri=REDIRECT_URI,
        )
        request.session["access_token"] = token["access_token"]
        request.session["refresh_token"] = token.get("refresh_token")
        request.session["id_token"] = token.get("id_token")

        next_url = request.session.pop("admin_next", None)
        return RedirectResponse(url=next_url or FRONTEND_URL)
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=400, detail="Token exchange failed")


@auth_router.get("/auth/logout")
async def app_logout(request: Request):
    id_token = request.session.get("id_token")
    refresh_token = request.session.get("refresh_token")

    if isinstance(refresh_token, str):
        try:
            keycloak_openid.logout(refresh_token)
        except Exception:
            pass

    request.session.clear()

    config = keycloak_openid.well_known()
    endpoint = str(config.get("end_session_endpoint", ""))
    browser_endpoint = endpoint.replace(INTERNAL_URL, EXTERNAL_URL)

    params = {"post_logout_redirect_uri": FRONTEND_URL}
    if isinstance(id_token, str):
        params["id_token_hint"] = id_token
    else:
        params["client_id"] = os.getenv("KEYCLOAK_CLIENT_ID", "knit-app")

    logout_url = f"{browser_endpoint}?{urlencode(params)}"
    return RedirectResponse(url=logout_url)


@auth_router.get("/auth/user", response_model=User)
async def active_user(request: Request, session: AsyncSession = Depends(get_session)):
    token = request.session.get("access_token")
    if not isinstance(token, str):
        raise HTTPException(status_code=401)

    payload: dict = decode(token, options={"verify_signature": False})

    # Check for record existence
    identity_id = payload.get("sub")
    if not identity_id:
        raise HTTPException(status_code=400)

    stmt = select(User).where(User.identity_id == identity_id)
    result = await session.execute(stmt)
    user = result.scalars().first()

    if not user:
        user = User(
            identity_id=identity_id,
            email=payload.get("email", ""),
            username=payload.get("preferred_username"),
            first_name=payload.get("given_name"),
            last_name=payload.get("family_name"),
            display_name=payload.get("name"),
        )
        session.add(user)
    else:
        user.email = payload.get("email") or user.email
        user.username = payload.get("preferred_username") or user.username
        user.first_name = payload.get("given_name") or user.first_name
        user.last_name = payload.get("family_name") or user.last_name
        user.display_name = payload.get("name") or user.display_name
        session.add(user)

    await session.commit()
    await session.refresh(user)
    return user
