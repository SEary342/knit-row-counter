from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .project import Section


class PatternRowBase(SQLModel):
    instruction: str
    stitches: Optional[int] = None
    order: int = Field(description="Order of the row in the section")


class PatternRow(PatternRowBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    section_id: UUID = Field(foreign_key="section.id")

    section: "Section" = Relationship(back_populates="patterns")
