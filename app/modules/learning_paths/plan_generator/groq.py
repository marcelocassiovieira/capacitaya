from app.modules.learning_paths.plan_generator._base_llm import LlmBackedPlanGenerator
from app.shared.llm import GroqClient


class GroqPlanGenerator(LlmBackedPlanGenerator):
    generator_name = "groq"

    def __init__(self, client: GroqClient | None = None) -> None:
        super().__init__(client or GroqClient())
