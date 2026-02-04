from fastapi import APIRouter, Depends

from backend.api.dependencies import get_current_user
from backend.models.user import User

router = APIRouter()


@router.get("/me", response_model=User)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Returns the current user's profile information."""
    return current_user
