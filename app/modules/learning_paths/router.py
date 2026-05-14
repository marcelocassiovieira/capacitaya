from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.learning_paths import service
from app.modules.learning_paths.plan_generator.base import PlanGenerator
from app.modules.learning_paths.plan_generator.factory import get_plan_generator
from app.modules.learning_paths.repository.base import LearningPathRepository
from app.modules.learning_paths.repository.factory import get_learning_path_repository
from app.modules.learning_paths.schemas import GapReport, StoredLearningPath


router = APIRouter(prefix="/learning-paths", tags=["learning-paths"])


@router.post(
    "",
    response_model=StoredLearningPath,
    status_code=status.HTTP_201_CREATED,
)
def create_learning_path(
    gap_report: GapReport,
    generator: PlanGenerator = Depends(get_plan_generator),
    repository: LearningPathRepository = Depends(get_learning_path_repository),
    db: Session = Depends(get_db),
) -> StoredLearningPath:
    return service.create_learning_path(generator, repository, gap_report, db)


@router.get("", response_model=list[StoredLearningPath])
def list_learning_paths(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    repository: LearningPathRepository = Depends(get_learning_path_repository),
) -> list[StoredLearningPath]:
    return service.list_learning_paths(repository, offset=offset, limit=limit)


@router.get("/{path_id}", response_model=StoredLearningPath)
def get_learning_path(
    path_id: int,
    repository: LearningPathRepository = Depends(get_learning_path_repository),
) -> StoredLearningPath:
    return service.get_learning_path(repository, path_id)


student_paths_router = APIRouter(prefix="/students", tags=["learning-paths"])


@student_paths_router.get(
    "/{email}/learning-paths", response_model=list[StoredLearningPath]
)
def list_paths_by_student(
    email: str,
    repository: LearningPathRepository = Depends(get_learning_path_repository),
) -> list[StoredLearningPath]:
    return service.list_paths_by_student(repository, email)
