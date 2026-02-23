import os
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from sqladmin.authentication import AuthenticationBackend


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        # Validate against environment variables
        # In production, ensure ADMIN_USERNAME and ADMIN_PASSWORD are set securely
        if username == os.getenv("ADMIN_USERNAME", "admin") and password == os.getenv(
            "ADMIN_PASSWORD", "admin"
        ):
            request.session.update({"token": "admin_token"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return "token" in request.session


class KeycloakAuth(AuthenticationBackend):
    def __init__(self, secret_key: str, keycloak_client=None):
        super().__init__(secret_key=secret_key)
        self.keycloak_client = keycloak_client

    async def login(self, request: Request) -> bool:
        return True

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return "access_token" in request.session


auth_router = APIRouter()
authentication_backend: AuthenticationBackend

if os.getenv("ENVIRONMENT") == "production":
    from keycloak import KeycloakOpenID

    keycloak_openid = KeycloakOpenID(
        server_url=os.getenv("KEYCLOAK_URL", ""),
        client_id=os.getenv("KEYCLOAK_CLIENT_ID", ""),
        realm_name=os.getenv("KEYCLOAK_REALM", ""),
        client_secret_key=os.getenv("KEYCLOAK_CLIENT_SECRET", ""),
    )

    authentication_backend = KeycloakAuth(
        secret_key=os.getenv("SECRET_KEY", "supersecret"),
        keycloak_client=keycloak_openid,
    )

    @auth_router.get("/auth/login")
    async def login_redirect():
        auth_url = keycloak_openid.auth_url(
            redirect_uri=os.getenv("KEYCLOAK_REDIRECT_URI", "")
        )
        # Fix for Docker: Browser needs localhost, but Backend needs container name
        auth_url = auth_url.replace("keycloak:8080", "localhost:8080")
        return RedirectResponse(auth_url)

    @auth_router.get("/auth/callback")
    async def login_callback(code: str, request: Request):
        token = keycloak_openid.token(
            grant_type="authorization_code",
            code=code,
            redirect_uri=os.getenv("KEYCLOAK_REDIRECT_URI", ""),
        )
        request.session["access_token"] = token["access_token"]
        return RedirectResponse("/admin")
else:
    authentication_backend = AdminAuth(
        secret_key=os.getenv("SECRET_KEY", "supersecret")
    )
