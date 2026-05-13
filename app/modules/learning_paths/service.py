from fastapi import HTTPException, status

from app.modules.learning_paths.plan_generator.base import PlanGenerator
from app.modules.learning_paths.schemas import GapReport, GeneratedPlan, SkillStatus


def generate_plan(generator: PlanGenerator, gap_report: GapReport) -> GeneratedPlan:
    if all(s.status == SkillStatus.READY for s in gap_report.skills):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El estudiante ya cumple todos los requerimientos del puesto.",
        )
    return generator.generate(gap_report)
