import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.job_descriptions.models import JobDescription
from app.modules.job_descriptions.schemas import JobDescriptionCreate


def find_all(db: Session, offset: int = 0, limit: int = 100) -> list[JobDescription]:
    statement = select(JobDescription).offset(offset).limit(limit).order_by(JobDescription.id)
    return list(db.scalars(statement).all())


def find_by_id(db: Session, job_id: int) -> JobDescription | None:
    return db.get(JobDescription, job_id)


def create(db: Session, data: JobDescriptionCreate) -> JobDescription:
    job = JobDescription(
        title=data.title,
        description=data.description,
        skills_json=json.dumps(data.skills),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def delete(db: Session, job: JobDescription) -> None:
    db.delete(job)
    db.commit()
