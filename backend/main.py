from backend.core.admin import (
    UserAdmin,
    ProjectAdmin,
    SectionAdmin,
    PatternRowAdmin,
    ProgressRecordAdmin,
)
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqladmin import Admin


# from backend.core.admin import ProjectAdmin, SectionAdmin, UserAdmin
from .api.v1.api import api_router
from .database import create_db_and_tables, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Create tables if they don't exist
    # Note: In production with Postgres, you'd usually use Alembic instead
    await create_db_and_tables()
    yield
    # 2. Shutdown: Clean up the engine connection pool
    await engine.dispose()


app = FastAPI(
    title="Knitting Project Tracker",
    description="Async API for managing knitting patterns and progress",
    version="0.1.0",
    lifespan=lifespan,
)

# Include your modular routers
app.include_router(api_router, prefix="/api/v1")

admin = Admin(app, engine)


admin.add_view(UserAdmin)
admin.add_view(ProjectAdmin)
admin.add_view(SectionAdmin)
admin.add_view(PatternRowAdmin)
admin.add_view(ProgressRecordAdmin)


@app.get("/")
async def root():
    return {"message": "Knitting Tracker API is online", "mode": "async"}
