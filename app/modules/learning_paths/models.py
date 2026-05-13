from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.modules.learning_paths.schemas import PathStatus


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    gap_analysis_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    readiness_score_initial: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_total_hours: Mapped[float] = mapped_column(nullable=False)
    generator_used: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[PathStatus] = mapped_column(
        Enum(PathStatus, name="path_status"), nullable=False
    )
    plan_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
