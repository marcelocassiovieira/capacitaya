from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.learning_paths.repository.base import LearningPathRepository
from app.modules.learning_paths.repository.sqlalchemy import (
    SqlAlchemyLearningPathRepository,
)


def get_learning_path_repository(
    db: Session = Depends(get_db),
) -> LearningPathRepository:
    return SqlAlchemyLearningPathRepository(db)
