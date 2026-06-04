from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.job_descriptions import service
from app.modules.job_descriptions.schemas import (
    JobDescriptionCreate,
    JobDescriptionResponse,
)

router = APIRouter(prefix="/job-descriptions", tags=["job-descriptions"])


@router.post(
    "",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_description(
    payload: JobDescriptionCreate, db: Session = Depends(get_db)
) -> JobDescriptionResponse:
    return service.create_job_description(db, payload)


@router.get("", response_model=list[JobDescriptionResponse])
def list_job_descriptions(
    province: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
) -> list[JobDescriptionResponse]:
    return service.list_job_descriptions(db, province=province)


@router.delete("/{jd_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_description(
    jd_id: int, db: Session = Depends(get_db)
) -> None:
    service.delete_job_description(db, jd_id)
