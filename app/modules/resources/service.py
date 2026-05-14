from sqlalchemy.orm import Session

from app.modules.resources import repository, suggester
from app.modules.resources.models import Resource


def get_or_suggest(db: Session, skill_name: str, phase: str) -> list[Resource]:
    existing = repository.find_active_by_skill_and_phase(db, skill_name, phase)
    if existing:
        return existing
    suggested = suggester.suggest_resources(skill_name, phase)
    if not suggested:
        return []
    return repository.bulk_save(db, suggested)
