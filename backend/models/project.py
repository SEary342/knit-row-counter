from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User
    from .pattern import PatternRow


class SectionBase(SQLModel):
    name: str
    repeat_rows: Optional[int] = None
    current_row: int = 0
    repeat_count: int = 0
    linked: bool = False
    total_repeats: Optional[int] = None
    stitch_count: Optional[int] = None
    locked: bool = False


class Section(SectionBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="project.id")

    patterns: List["PatternRow"] = Relationship(back_populates="section")
    project: "Project" = Relationship(back_populates="sections")


class ProjectBase(SQLModel):
    name: str
    total_rows: Optional[int] = None
    current_row: int = 0
    notes: str = ""
    pattern_url: Optional[str] = None


class Project(ProjectBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    sections: List["Section"] = Relationship(back_populates="project")
    user_id: UUID = Field(foreign_key="user.id", index=True)
    owner: "User" = Relationship(back_populates="projects")


class ProjectUpdate(SQLModel):
    name: Optional[str] = None
    total_rows: Optional[int] = None
    notes: Optional[str] = None
    pattern_url: Optional[str] = None
