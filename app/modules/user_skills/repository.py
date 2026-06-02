from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.job_descriptions.models import SkillLevel
from app.modules.skills.models import Skill
from app.modules.user_skills.models import UserSkill


def find_by_user(db: Session, user_id: int) -> list[tuple[UserSkill, str]]:
    stmt = (
        select(UserSkill, Skill.name)
        .join(Skill, UserSkill.skill_id == Skill.id)
        .where(UserSkill.user_id == user_id)
        .order_by(UserSkill.created_at)
    )
    return [(row[0], row[1]) for row in db.execute(stmt).all()]


def find_one(db: Session, user_id: int, skill_id: int) -> UserSkill | None:
    stmt = select(UserSkill).where(
        UserSkill.user_id == user_id,
        UserSkill.skill_id == skill_id,
    )
    return db.scalar(stmt)


def add(db: Session, user_id: int, skill_id: int, level: SkillLevel) -> UserSkill:
    user_skill = UserSkill(user_id=user_id, skill_id=skill_id, level=level)
    db.add(user_skill)
    db.commit()
    db.refresh(user_skill)
    return user_skill


def remove(db: Session, user_id: int, skill_id: int) -> bool:
    user_skill = find_one(db, user_id, skill_id)
    if user_skill is None:
        return False
    db.delete(user_skill)
    db.commit()
    return True
