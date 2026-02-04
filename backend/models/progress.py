from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ProgressRecord(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(index=True)
    section_id: UUID
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    rows_delta: int
    stitches_delta: int
