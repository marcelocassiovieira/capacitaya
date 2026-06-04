from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.skills.models import Skill
from app.modules.skills.schemas import SkillCreate


def find_by_name_ilike(db: Session, name: str) -> Skill | None:
    statement = select(Skill).where(Skill.name.ilike(name))
    return db.scalar(statement)


def search(db: Session, q: str, limit: int = 20) -> list[Skill]:
    statement = (
        select(Skill)
        .where(Skill.name.ilike(f"%{q}%"))
        .order_by(Skill.name)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def create(db: Session, data: SkillCreate) -> Skill:
    skill = Skill(name=data.name)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def count(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(Skill)) or 0


def bulk_create(db: Session, names: list[str]) -> None:
    db.add_all([Skill(name=name) for name in names])
    db.commit()
