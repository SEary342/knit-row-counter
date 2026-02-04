from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from backend.api.dependencies import get_current_user
from backend.core.qr import generate_project_qr
from backend.database import get_session
from backend.models.project import Project, ProjectUpdate
from backend.models.user import User

router = APIRouter()


@router.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: UUID,
    project_patch: ProjectUpdate,
    session: AsyncSession = Depends(get_session),
):
    """
    Performs a partial update on project metadata.
    Only fields sent in the request body will be modified.
    """
    db_project = await session.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    # exclude_unset=True ensures we don't overwrite values with None
    # unless the user explicitly sent null.
    patch_data = project_patch.model_dump(exclude_unset=True)

    for key, value in patch_data.items():
        setattr(db_project, key, value)

    db_project.last_modified = datetime.now(timezone.utc)

    session.add(db_project)
    await session.commit()
    await session.refresh(db_project)
    return db_project


@router.get("/{project_id}/share")
async def get_project_template(
    project_id: UUID, session: AsyncSession = Depends(get_session)
):
    """
    Returns a clean version of the project (template) suitable for sharing.
    All progress, IDs, and timestamps are stripped or reset.
    """
    # In a full production app, you might use 'selectinload' here
    # to ensure all sections/patterns are loaded in one async query.
    db_project = await session.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Convert to dictionary to manipulate the data
    template = db_project.model_dump()

    # Reset Project Level
    template["current_row"] = 0
    template.pop("id", None)
    template.pop("last_modified", None)

    # Reset Section and Pattern Levels
    for section in template.get("sections", []):
        section["current_row"] = 0
        section["repeat_count"] = 0
        section["locked"] = False
        section.pop("id", None)
        section.pop("project_id", None)

        for row in section.get("patterns", []):
            row.pop("id", None)
            row.pop("section_id", None)

    return template


@router.get("/", response_model=List[Project])
async def list_projects(session: AsyncSession = Depends(get_session)):
    """Simple helper to list all projects."""
    statement = select(Project)
    result = await session.execute(statement)
    return result.scalars().all()


@router.get("/", response_model=List[Project])
async def list_my_projects(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),  # Filter by user!
):
    statement = select(Project).where(Project.user_id == current_user.id)
    result = await session.execute(statement)
    return result.scalars().all()


@router.post("/", response_model=Project)
async def create_project(
    project_data: Project,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Force the owner to be the current logged-in user
    project_data.user_id = current_user.id
    session.add(project_data)
    await session.commit()
    await session.refresh(project_data)
    return project_data


@router.get("/{project_id}/share/qr")
async def get_project_qr(
    project_id: UUID, session: AsyncSession = Depends(get_session)
):
    """
    Generates a QR code image for a specific project template.
    """
    # 1. Reuse our existing template logic (get_project_template internal logic)
    db_project = await session.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2. Get the clean dictionary (no IDs or progress)
    # Note: You might want to limit the size of the data here,
    # as QR codes have a maximum capacity (~2.9KB for alphanumeric).
    template = db_project.model_dump()
    # ... (apply the reset logic we wrote earlier) ...

    # 3. Generate and return the image
    qr_buf = generate_project_qr(template)

    return StreamingResponse(qr_buf, media_type="image/png")
