from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.learning_paths.models import LearningPath
from app.modules.learning_paths.schemas import (
    GeneratedPlan,
    PathStatus,
    StoredLearningPath,
)


class SqlAlchemyLearningPathRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def save(self, plan: GeneratedPlan) -> StoredLearningPath:
        record = LearningPath(
            student_email=plan.student_email,
            student_name=plan.student_name,
            company_name=plan.company_name,
            target_role_title=plan.target_role_title,
            gap_analysis_id=plan.gap_analysis_id,
            readiness_score_initial=plan.readiness_score_initial,
            estimated_total_hours=plan.estimated_total_hours,
            generator_used=plan.generator_used,
            status=PathStatus.ACTIVE,
            plan_json=plan.model_dump_json(),
        )
        self._db.add(record)
        self._db.commit()
        self._db.refresh(record)
        return self._to_schema(record)

    def find_by_id(self, path_id: int) -> StoredLearningPath | None:
        record = self._db.get(LearningPath, path_id)
        return self._to_schema(record) if record else None

    def find_by_student_email(self, email: str) -> list[StoredLearningPath]:
        statement = (
            select(LearningPath)
            .where(func.lower(LearningPath.student_email) == email.lower())
            .order_by(LearningPath.id)
        )
        return [self._to_schema(r) for r in self._db.scalars(statement).all()]

    def list_all(self, offset: int = 0, limit: int = 100) -> list[StoredLearningPath]:
        statement = (
            select(LearningPath).order_by(LearningPath.id).offset(offset).limit(limit)
        )
        return [self._to_schema(r) for r in self._db.scalars(statement).all()]

    @staticmethod
    def _to_schema(record: LearningPath) -> StoredLearningPath:
        plan = GeneratedPlan.model_validate_json(record.plan_json)
        return StoredLearningPath(
            id=record.id,
            status=record.status,
            created_at=record.created_at,
            updated_at=record.updated_at,
            **plan.model_dump(),
        )
