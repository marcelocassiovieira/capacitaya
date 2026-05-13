from functools import lru_cache

from app.modules.learning_paths.repository.base import LearningPathRepository
from app.modules.learning_paths.repository.in_memory import (
    InMemoryLearningPathRepository,
)


@lru_cache(maxsize=1)
def get_learning_path_repository() -> LearningPathRepository:
    return InMemoryLearningPathRepository()
