from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.skills.models import Skill
from app.modules.user_skills import repository
from app.modules.user_skills.schemas import UserSkillCreate, UserSkillResponse
from app.modules.users import repository as users_repository


def _get_user_or_404(db: Session, email: str):
    user = users_repository.find_by_email(db, email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def list_for_user(db: Session, email: str) -> list[UserSkillResponse]:
    user = _get_user_or_404(db, email)
    rows = repository.find_by_user(db, user.id)
    return [
        UserSkillResponse(
            id=us.id,
            skill_id=us.skill_id,
            skill_name=skill_name,
            level=us.level,
            created_at=us.created_at,
        )
        for us, skill_name in rows
    ]


def add_skill(db: Session, email: str, data: UserSkillCreate) -> UserSkillResponse:
    user = _get_user_or_404(db, email)

    if repository.find_one(db, user.id, data.skill_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill already added")

    skill = db.get(Skill, data.skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    user_skill = repository.add(db, user.id, data.skill_id, data.level)
    return UserSkillResponse(
        id=user_skill.id,
        skill_id=user_skill.skill_id,
        skill_name=skill.name,
        level=user_skill.level,
        created_at=user_skill.created_at,
    )


def remove_skill(db: Session, email: str, skill_id: int) -> None:
    user = _get_user_or_404(db, email)
    removed = repository.remove(db, user.id, skill_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not in user's list")
