from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

from app.config import settings
from app.database import create_db_tables
from app.modules.attempts.router import (
    router as attempts_router,
    student_attempts_router,
)
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


app.include_router(users_router, prefix="/api")
app.include_router(learning_paths_router, prefix="/api")
app.include_router(student_paths_router, prefix="/api")
app.include_router(attempts_router, prefix="/api")
app.include_router(student_attempts_router, prefix="/api")

_FRONTEND_DIR = Path("frontend/artifacts/capacitaya/dist/public")


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str) -> FileResponse:
    candidate = _FRONTEND_DIR / full_path
    if candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(_FRONTEND_DIR / "index.html")
