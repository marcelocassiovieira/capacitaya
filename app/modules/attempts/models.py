from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    learning_path_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    module_index: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_index: Mapped[int] = mapped_column(Integer, nullable=False)
    exercise_index: Mapped[int] = mapped_column(Integer, nullable=False)
    skill_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    expected_answer: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    ai_feedback: Mapped[str] = mapped_column(Text, nullable=False)
    time_spent_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
