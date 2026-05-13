from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.attempts.models import Attempt


def create(db: Session, attempt: Attempt) -> Attempt:
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def find_by_id(db: Session, attempt_id: int) -> Attempt | None:
    return db.get(Attempt, attempt_id)


def find_by_student(
    db: Session, student_email: str, offset: int = 0, limit: int = 100
) -> list[Attempt]:
    statement = (
        select(Attempt)
        .where(func.lower(Attempt.student_email) == student_email.lower())
        .order_by(Attempt.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def find_by_student_and_skill(
    db: Session, student_email: str, skill_name: str
) -> list[Attempt]:
    statement = (
        select(Attempt)
        .where(func.lower(Attempt.student_email) == student_email.lower())
        .where(Attempt.skill_name == skill_name)
        .order_by(Attempt.id)
    )
    return list(db.scalars(statement).all())
