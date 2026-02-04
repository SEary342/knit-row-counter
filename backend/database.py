import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel
from typing import AsyncGenerator

# 1. Database URL Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./database.db")

# 2. Engine Creation
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_async_engine(DATABASE_URL, echo=True, connect_args=connect_args)

# 3. Async Session Factory
# Use async_sessionmaker to satisfy the type checker (resolves E731/no-matching-overload)
async_session_factory = async_sessionmaker(
    bind=engine, expire_on_commit=False, class_=AsyncSession
)


# 4. Dependency for FastAPI Routes
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


# 5. Async Table Creation
async def create_db_and_tables():
    from .models.user import User  # noqa: F401
    from .models.project import Project, Section  # noqa: F401
    from .models.pattern import PatternRow  # noqa: F401
    from .models.progress import ProgressRecord  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
