from datetime import datetime, timezone
from threading import Lock

from app.modules.learning_paths.schemas import (
    GeneratedPlan,
    PathStatus,
    StoredLearningPath,
)


class InMemoryLearningPathRepository:
    def __init__(self) -> None:
        self._store: dict[int, StoredLearningPath] = {}
        self._next_id = 1
        self._lock = Lock()

    def save(self, plan: GeneratedPlan) -> StoredLearningPath:
        with self._lock:
            now = datetime.now(timezone.utc)
            stored = StoredLearningPath(
                id=self._next_id,
                status=PathStatus.ACTIVE,
                created_at=now,
                updated_at=now,
                **plan.model_dump(),
            )
            self._store[self._next_id] = stored
            self._next_id += 1
            return stored

    def find_by_id(self, path_id: int) -> StoredLearningPath | None:
        return self._store.get(path_id)

    def find_by_student_email(self, email: str) -> list[StoredLearningPath]:
        normalized = email.lower()
        return [p for p in self._store.values() if p.student_email.lower() == normalized]

    def list_all(self, offset: int = 0, limit: int = 100) -> list[StoredLearningPath]:
        paths = sorted(self._store.values(), key=lambda p: p.id)
        return paths[offset : offset + limit]
