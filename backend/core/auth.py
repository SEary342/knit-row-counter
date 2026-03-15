import os
from typing import Union
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from jwt import decode
from keycloak import KeycloakOpenID
from sqladmin.authentication import AuthenticationBackend
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from backend.database import get_session
from backend.models import User

# --- CONFIGURATION ---
INTERNAL_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080").rstrip("/")
EXTERNAL_URL = os.getenv("KEYCLOAK_EXTERNAL_URL", "http://localhost:8080").rstrip("/")
REDIRECT_URI_DEFAULT = os.getenv(
    "KEYCLOAK_REDIRECT_URI", "http://localhost:3000/auth/callback"
)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "knit-app")

keycloak_openid = KeycloakOpenID(
    server_url=INTERNAL_URL,
    client_id=CLIENT_ID,
    realm_name=os.getenv("KEYCLOAK_REALM", "knit-realm"),
    client_secret_key=os.getenv("KEYCLOAK_CLIENT_SECRET", ""),
)

# --- UTILITIES ---


def get_request_redirect_uri(request: Request) -> str:
    """Determine the callback URL based on the current origin (port)."""
    host = request.headers.get("host", "")
    if "8000" in host:
        return "http://localhost:8000/auth/callback"
    return REDIRECT_URI_DEFAULT


def get_logout_url(request: Request) -> str:
    """Construct the Keycloak logout URL with appropriate hints to avoid confirmation screens."""
    id_token = request.session.get("id_token")
    realm = os.getenv("KEYCLOAK_REALM", "knit-realm")
    host = request.headers.get("host", "")
    post_logout_uri = "http://localhost:8000/admin" if "8000" in host else FRONTEND_URL

    # Attempt to discover the endpoint, but fallback to the standard path if it fails or returns None
    try:
        config = keycloak_openid.well_known()
        endpoint = config.get("end_session_endpoint")
    except Exception:
        endpoint = None

    if not endpoint:
        endpoint = f"{INTERNAL_URL}/realms/{realm}/protocol/openid-connect/logout"

    browser_endpoint = str(endpoint).replace(INTERNAL_URL, EXTERNAL_URL)

    params = {"post_logout_redirect_uri": post_logout_uri, "client_id": CLIENT_ID}
    if isinstance(id_token, str):
        params["id_token_hint"] = id_token

    return f"{browser_endpoint}?{urlencode(params)}"


# --- SQLADMIN AUTHENTICATION BACKEND ---


class KeycloakAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        return True

    async def logout(self, request: Request) -> Union[bool, RedirectResponse]:
        logout_url = get_logout_url(request)
        request.session.clear()
        return RedirectResponse(logout_url)

    async def authenticate(self, request: Request) -> Union[bool, RedirectResponse]:
        token = request.session.get("access_token")

        if not token:
            request.session["admin_next"] = str(request.url)
            redirect_uri = get_request_redirect_uri(request)
            auth_url = keycloak_openid.auth_url(redirect_uri=redirect_uri)
            return RedirectResponse(str(auth_url).replace(INTERNAL_URL, EXTERNAL_URL))

        try:
            payload = decode(token, options={"verify_signature": False})
            roles = payload.get("realm_access", {}).get("roles", [])
            if "admin" not in roles:
                return RedirectResponse(url="/auth/unauthorized")
            return True
        except Exception:
            return False


authentication_backend = KeycloakAuth(secret_key=os.getenv("SECRET_KEY", "supersecret"))

# --- APP ROUTER ---

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.get("/unauthorized")
async def unauthorized():
    content = f"""
    <html>
        <head><title>Access Denied</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>403 - Access Denied</h1>
            <p>You are authenticated, but you do not have the administrative privileges required to access this area.</p>
            <p><a href="{FRONTEND_URL}">Return to Application</a> | <a href="/auth/logout">Logout</a></p>
        </body>
    </html>
    """
    return HTMLResponse(content=content, status_code=403)


@auth_router.get("/login")
async def app_login(request: Request):
    redirect_uri = get_request_redirect_uri(request)
    auth_url = keycloak_openid.auth_url(redirect_uri=redirect_uri)
    return RedirectResponse(str(auth_url).replace(INTERNAL_URL, EXTERNAL_URL))


@auth_router.get("/callback")
async def login_callback(code: str, request: Request):
    try:
        redirect_uri = get_request_redirect_uri(request)
        token = keycloak_openid.token(
            grant_type="authorization_code",
            code=code,
            redirect_uri=redirect_uri,
        )
        request.session.update(
            {
                "access_token": token["access_token"],
                "refresh_token": token.get("refresh_token"),
                "id_token": token.get("id_token"),
            }
        )

        next_url = request.session.pop("admin_next", None)
        return RedirectResponse(url=next_url or FRONTEND_URL)
    except Exception:
        raise HTTPException(status_code=400, detail="Token exchange failed")


@auth_router.get("/logout")
async def app_logout(request: Request):
    logout_url = get_logout_url(request)
    refresh_token = request.session.get("refresh_token")

    if isinstance(refresh_token, str):
        try:
            keycloak_openid.logout(refresh_token)
        except Exception:
            pass

    request.session.clear()
    return RedirectResponse(url=logout_url)


@auth_router.get("/user", response_model=User)
async def active_user(request: Request, session: AsyncSession = Depends(get_session)):
    token = request.session.get("access_token")
    if not isinstance(token, str):
        raise HTTPException(status_code=401)

    payload: dict = decode(token, options={"verify_signature": False})
    identity_id = payload.get("sub")
    if not identity_id:
        raise HTTPException(status_code=400)

    stmt = select(User).where(User.identity_id == identity_id)
    result = await session.execute(stmt)
    user = result.scalars().first()

    user_data = {
        "identity_id": identity_id,
        "email": payload.get("email", ""),
        "username": payload.get("preferred_username"),
        "first_name": payload.get("given_name"),
        "last_name": payload.get("family_name"),
        "display_name": payload.get("name"),
    }

    if not user:
        user = User(**user_data)  # ty:ignore[invalid-argument-type]
    else:
        for key, value in user_data.items():
            if value:
                setattr(user, key, value)

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
