from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.resources.models import Resource


def find_active_by_skill_and_phase(
    db: Session, skill_name: str, phase: str
) -> list[Resource]:
    statement = (
        select(Resource)
        .where(Resource.skill_name == skill_name)
        .where(Resource.phase == phase)
        .where(Resource.is_active.is_(True))
        .order_by(Resource.id)
    )
    return list(db.scalars(statement).all())


def bulk_save(db: Session, resources: list[Resource]) -> list[Resource]:
    if not resources:
        return []
    db.add_all(resources)
    db.commit()
    for resource in resources:
        db.refresh(resource)
    return resources
