from typing import Protocol

from app.modules.learning_paths.schemas import GapReport, GeneratedPlan


class PlanGenerator(Protocol):
    def generate(self, gap_report: GapReport) -> GeneratedPlan: ...
