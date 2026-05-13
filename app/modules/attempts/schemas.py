from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AttemptCreate(BaseModel):
    student_email: EmailStr
    learning_path_id: int = Field(ge=1)
    module_index: int = Field(ge=0)
    unit_index: int = Field(ge=0)
    exercise_index: int = Field(ge=0)
    answer: str = Field(min_length=1, max_length=1000)
    time_spent_seconds: int | None = Field(default=None, ge=0)


class AttemptResponse(BaseModel):
    id: int
    student_email: EmailStr
    learning_path_id: int
    module_index: int
    unit_index: int
    exercise_index: int
    skill_name: str
    answer: str
    expected_answer: str
    is_correct: bool
    score: float
    ai_feedback: str
    skill_mastery: float = Field(
        description="Porcentaje (0.0 a 1.0) de aciertos del estudiante en esta skill."
    )
    mastery_threshold_reached: bool = Field(
        description="True si skill_mastery >= 0.80."
    )
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
