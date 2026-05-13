from fastapi import APIRouter, Depends, status

from app.modules.learning_paths import service
from app.modules.learning_paths.plan_generator.base import PlanGenerator
from app.modules.learning_paths.plan_generator.factory import get_plan_generator
from app.modules.learning_paths.schemas import GapReport, GeneratedPlan


router = APIRouter(prefix="/learning-paths", tags=["learning-paths"])


@router.post(
    "/generate",
    response_model=GeneratedPlan,
    status_code=status.HTTP_201_CREATED,
)
def generate_learning_path(
    gap_report: GapReport,
    generator: PlanGenerator = Depends(get_plan_generator),
) -> GeneratedPlan:
    return service.generate_plan(generator, gap_report)
