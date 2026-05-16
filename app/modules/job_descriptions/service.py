from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.job_descriptions import repository
from app.modules.job_descriptions.models import JobDescription
from app.modules.job_descriptions.schemas import JobDescriptionCreate


def list_job_descriptions(db: Session, offset: int = 0, limit: int = 100) -> list[JobDescription]:
    return repository.find_all(db, offset=offset, limit=limit)


def get_job_description(db: Session, job_id: int) -> JobDescription:
    job = repository.find_by_id(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found")
    return job


def create_job_description(db: Session, data: JobDescriptionCreate) -> JobDescription:
    return repository.create(db, data)


def delete_job_description(db: Session, job_id: int) -> None:
    job = get_job_description(db, job_id)
    repository.delete(db, job)
