from app.modules.learning_paths.plan_generator.base import PlanGenerator
from app.modules.learning_paths.plan_generator.mock import MockPlanGenerator


def get_plan_generator() -> PlanGenerator:
    return MockPlanGenerator()
