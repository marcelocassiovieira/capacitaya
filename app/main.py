from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from app.config import settings
from app.database import create_db_tables
from app.modules.learning_paths.router import (
    router as learning_paths_router,
    student_paths_router,
)
from app.modules.users.router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    create_db_tables()
    yield


app = FastAPI(title=settings.app_name, debug=settings.app_debug, lifespan=lifespan)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}


app.include_router(users_router)
app.include_router(learning_paths_router)
app.include_router(student_paths_router)
