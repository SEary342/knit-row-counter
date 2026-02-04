from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .project import Project


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    identity_id: str = Field(index=True, unique=True)
    email: str
    username: Optional[str] = None

    projects: List["Project"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"lazy": "selectin"}
    )
