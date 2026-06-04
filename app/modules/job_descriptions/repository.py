from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.job_descriptions.models import (
    JobDescription,
    JobDescriptionSkill,
    SkillLevel,
)
from app.modules.job_descriptions.schemas import JobDescriptionCreate
from app.modules.skills.models import Skill


def create(db: Session, data: JobDescriptionCreate) -> JobDescription:
    jd = JobDescription(
        user_id=data.user_id,
        title=data.title,
        description=data.description,
        province=data.province,
    )
    db.add(jd)
    db.flush()
    for req in data.required_skills:
        db.add(
            JobDescriptionSkill(
                job_description_id=jd.id,
                skill_id=req.skill_id,
                level=req.level,
            )
        )
    db.commit()
    db.refresh(jd)
    return jd


def find_all(db: Session, province: str | None = None) -> list[JobDescription]:
    statement = select(JobDescription).order_by(JobDescription.created_at.desc())
    if province:
        statement = statement.where(JobDescription.province == province)
    return list(db.scalars(statement).all())


def find_by_id(db: Session, jd_id: int) -> JobDescription | None:
    return db.get(JobDescription, jd_id)


def find_skills_for_jd(
    db: Session, jd_id: int
) -> list[tuple[int, str, SkillLevel]]:
    """Returns list of (skill_id, skill_name, level)."""
    statement = (
        select(JobDescriptionSkill.skill_id, Skill.name, JobDescriptionSkill.level)
        .join(Skill, Skill.id == JobDescriptionSkill.skill_id)
        .where(JobDescriptionSkill.job_description_id == jd_id)
    )
    return list(db.execute(statement).all())


def delete(db: Session, jd: JobDescription) -> None:
    db.delete(jd)
    db.commit()
