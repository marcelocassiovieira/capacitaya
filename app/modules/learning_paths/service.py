from fastapi import HTTPException, status

from app.modules.learning_paths.plan_generator.base import PlanGenerator
from app.modules.learning_paths.repository.base import LearningPathRepository
from app.modules.learning_paths.schemas import (
    GapReport,
    SkillStatus,
    StoredLearningPath,
)


def create_learning_path(
    generator: PlanGenerator,
    repository: LearningPathRepository,
    gap_report: GapReport,
) -> StoredLearningPath:
    if all(s.status == SkillStatus.READY for s in gap_report.skills):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El estudiante ya cumple todos los requerimientos del puesto.",
        )
    plan = generator.generate(gap_report)
    return repository.save(plan)


def get_learning_path(
    repository: LearningPathRepository, path_id: int
) -> StoredLearningPath:
    path = repository.find_by_id(path_id)
    if path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path no encontrado.",
        )
    return path


def list_learning_paths(
    repository: LearningPathRepository, offset: int = 0, limit: int = 100
) -> list[StoredLearningPath]:
    return repository.list_all(offset=offset, limit=limit)


def list_paths_by_student(
    repository: LearningPathRepository, email: str
) -> list[StoredLearningPath]:
    return repository.find_by_student_email(email)
