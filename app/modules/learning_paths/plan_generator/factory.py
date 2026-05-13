import logging

from app.config import settings
from app.modules.learning_paths.plan_generator.base import PlanGenerator
from app.modules.learning_paths.plan_generator.mock import MockPlanGenerator
from app.modules.learning_paths.schemas import GapReport, GeneratedPlan


logger = logging.getLogger(__name__)


class _GeminiWithMockFallback:
    def __init__(self, primary: PlanGenerator, fallback: PlanGenerator) -> None:
        self._primary = primary
        self._fallback = fallback

    def generate(self, gap_report: GapReport) -> GeneratedPlan:
        try:
            return self._primary.generate(gap_report)
        except Exception:
            logger.exception(
                "Gemini plan generation failed; falling back to MockPlanGenerator."
            )
            return self._fallback.generate(gap_report)


def get_plan_generator() -> PlanGenerator:
    if settings.plan_generator.lower() != "gemini":
        return MockPlanGenerator()

    try:
        from app.modules.learning_paths.plan_generator.gemini import (
            GeminiPlanGenerator,
        )

        return _GeminiWithMockFallback(GeminiPlanGenerator(), MockPlanGenerator())
    except Exception:
        logger.exception(
            "Could not initialize GeminiPlanGenerator; using MockPlanGenerator."
        )
        return MockPlanGenerator()
