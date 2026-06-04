from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.job_descriptions import repository
from app.modules.job_descriptions.schemas import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    PostedByResponse,
    SkillRequirementOut,
)
from app.modules.users import repository as users_repository
from app.modules.users.models import UserRole


def _build_response(db: Session, jd) -> JobDescriptionResponse:
    user = users_repository.find_by_id(db, jd.user_id)
    skills_rows = repository.find_skills_for_jd(db, jd.id)
    if user is None:
        posted_by = PostedByResponse(id=0, first_name="[Eliminado]", last_name="", email="")
    else:
        posted_by = PostedByResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
        )
    return JobDescriptionResponse(
        id=jd.id,
        title=jd.title,
        description=jd.description,
        province=jd.province,
        posted_by=posted_by,
        required_skills=[
            SkillRequirementOut(skill_id=sid, skill_name=sname, level=level)
            for sid, sname, level in skills_rows
        ],
        created_at=jd.created_at,
    )


def create_job_description(
    db: Session, data: JobDescriptionCreate
) -> JobDescriptionResponse:
    user = users_repository.find_by_id(db, data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if user.role != UserRole.company_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company_admin users can post job descriptions",
        )
    jd = repository.create(db, data)
    return _build_response(db, jd)


def list_job_descriptions(
    db: Session, province: str | None = None
) -> list[JobDescriptionResponse]:
    jds = repository.find_all(db, province=province)
    return [_build_response(db, jd) for jd in jds]


def delete_job_description(db: Session, jd_id: int) -> None:
    jd = repository.find_by_id(db, jd_id)
    if jd is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found",
        )
    repository.delete(db, jd)
