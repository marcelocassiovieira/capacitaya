from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.attempts import service
from app.modules.attempts.schemas import AttemptCreate, AttemptResponse


router = APIRouter(prefix="/attempts", tags=["attempts"])


@router.post("", response_model=AttemptResponse, status_code=status.HTTP_201_CREATED)
def create_attempt(payload: AttemptCreate, db: Session = Depends(get_db)) -> dict:
    return service.create_attempt(db, payload)


@router.get("/{attempt_id}", response_model=AttemptResponse)
def get_attempt(attempt_id: int, db: Session = Depends(get_db)) -> dict:
    return service.get_attempt(db, attempt_id)


student_attempts_router = APIRouter(prefix="/students", tags=["attempts"])


@student_attempts_router.get(
    "/{email}/attempts", response_model=list[AttemptResponse]
)
def list_attempts_by_student(
    email: str,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[dict]:
    return service.list_attempts_by_student(db, email, offset=offset, limit=limit)
