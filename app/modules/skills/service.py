from sqlalchemy.orm import Session

from app.modules.skills import repository
from app.modules.skills.models import Skill
from app.modules.skills.schemas import SkillCreate


def search(db: Session, q: str) -> list[Skill]:
    if not q.strip():
        return []
    return repository.search(db, q)


def get_or_create(db: Session, data: SkillCreate) -> tuple[Skill, bool]:
    """Returns (skill, created). created=True if the skill is new."""
    existing = repository.find_by_name_ilike(db, data.name)
    if existing is not None:
        return existing, False
    return repository.create(db, data), True
