from fastapi import APIRouter

from .endpoints import progress, projects

api_router = APIRouter()

# We give each one a unique prefix and tag here
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
