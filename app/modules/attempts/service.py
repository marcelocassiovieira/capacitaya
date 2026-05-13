import json

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.attempts import feedback, repository
from app.modules.attempts.models import Attempt
from app.modules.attempts.schemas import AttemptCreate
from app.modules.learning_paths.models import LearningPath


MASTERY_THRESHOLD = 0.80


class _ResolvedExercise:
    __slots__ = ("skill_name", "expected_answer", "prompt", "type")

    def __init__(
        self, skill_name: str, expected_answer: str, prompt: str, exercise_type: str
    ) -> None:
        self.skill_name = skill_name
        self.expected_answer = expected_answer
        self.prompt = prompt
        self.type = exercise_type


def create_attempt(db: Session, data: AttemptCreate) -> dict:
    path = db.get(LearningPath, data.learning_path_id)
    if path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path no encontrado.",
        )
    if path.student_email.lower() != data.student_email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El learning path no pertenece a este estudiante.",
        )

    plan = json.loads(path.plan_json)
    exercise = _resolve_exercise(plan, data.module_index, data.unit_index, data.exercise_index)

    is_correct = _evaluate(data.answer, exercise.expected_answer, exercise.type)
    score = 1.0 if is_correct else 0.0

    attempt = Attempt(
        student_email=data.student_email,
        learning_path_id=data.learning_path_id,
        module_index=data.module_index,
        unit_index=data.unit_index,
        exercise_index=data.exercise_index,
        skill_name=exercise.skill_name,
        answer=data.answer,
        expected_answer=exercise.expected_answer,
        is_correct=is_correct,
        score=score,
        ai_feedback="",
        time_spent_seconds=data.time_spent_seconds,
    )
    attempt = repository.create(db, attempt)

    skill_mastery = _compute_skill_mastery(db, data.student_email, exercise.skill_name)

    ai_feedback = feedback.generate_feedback(
        student_name=path.student_name,
        skill_name=exercise.skill_name,
        exercise_prompt=exercise.prompt,
        student_answer=data.answer,
        expected_answer=exercise.expected_answer,
        is_correct=is_correct,
        skill_mastery=skill_mastery,
    )
    attempt.ai_feedback = ai_feedback
    db.commit()
    db.refresh(attempt)

    return _serialize(attempt, skill_mastery)


def get_attempt(db: Session, attempt_id: int) -> dict:
    attempt = repository.find_by_id(db, attempt_id)
    if attempt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attempt no encontrado."
        )
    skill_mastery = _compute_skill_mastery(db, attempt.student_email, attempt.skill_name)
    return _serialize(attempt, skill_mastery)


def list_attempts_by_student(
    db: Session, student_email: str, offset: int = 0, limit: int = 100
) -> list[dict]:
    attempts = repository.find_by_student(db, student_email, offset=offset, limit=limit)
    if not attempts:
        return []
    mastery_cache: dict[str, float] = {}
    serialized: list[dict] = []
    for attempt in attempts:
        if attempt.skill_name not in mastery_cache:
            mastery_cache[attempt.skill_name] = _compute_skill_mastery(
                db, attempt.student_email, attempt.skill_name
            )
        serialized.append(_serialize(attempt, mastery_cache[attempt.skill_name]))
    return serialized


def _resolve_exercise(
    plan: dict, module_index: int, unit_index: int, exercise_index: int
) -> _ResolvedExercise:
    modules = plan.get("modules") or []
    if module_index >= len(modules):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El plan no tiene module_index={module_index}.",
        )
    module = modules[module_index]
    units = module.get("units") or []
    if unit_index >= len(units):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El modulo no tiene unit_index={unit_index}.",
        )
    unit = units[unit_index]
    exercises = unit.get("exercises") or []
    if exercise_index >= len(exercises):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La unit no tiene exercise_index={exercise_index}.",
        )
    exercise = exercises[exercise_index]
    return _ResolvedExercise(
        skill_name=module.get("skill_name", ""),
        expected_answer=exercise.get("expected_answer", ""),
        prompt=exercise.get("prompt", ""),
        exercise_type=exercise.get("type", "text"),
    )


def _evaluate(student_answer: str, expected_answer: str, exercise_type: str) -> bool:
    normalized_student = student_answer.strip()
    normalized_expected = expected_answer.strip()
    if exercise_type == "multiple_choice":
        return normalized_student.upper() == normalized_expected.upper()
    return normalized_student.lower() == normalized_expected.lower()


def _compute_skill_mastery(db: Session, student_email: str, skill_name: str) -> float:
    attempts = repository.find_by_student_and_skill(db, student_email, skill_name)
    if not attempts:
        return 0.0
    correct = sum(1 for a in attempts if a.is_correct)
    return round(correct / len(attempts), 4)


def _serialize(attempt: Attempt, skill_mastery: float) -> dict:
    return {
        "id": attempt.id,
        "student_email": attempt.student_email,
        "learning_path_id": attempt.learning_path_id,
        "module_index": attempt.module_index,
        "unit_index": attempt.unit_index,
        "exercise_index": attempt.exercise_index,
        "skill_name": attempt.skill_name,
        "answer": attempt.answer,
        "expected_answer": attempt.expected_answer,
        "is_correct": attempt.is_correct,
        "score": attempt.score,
        "ai_feedback": attempt.ai_feedback,
        "skill_mastery": skill_mastery,
        "mastery_threshold_reached": skill_mastery >= MASTERY_THRESHOLD,
        "created_at": attempt.created_at,
    }
