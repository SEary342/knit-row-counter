from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_session
from backend.models.progress import ProgressRecord

router = APIRouter()


@router.post("/", response_model=ProgressRecord)
async def add_progress(
    record: ProgressRecord, session: AsyncSession = Depends(get_session)
):
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return record
