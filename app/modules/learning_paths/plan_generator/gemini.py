from app.modules.learning_paths.plan_generator._base_llm import LlmBackedPlanGenerator
from app.shared.llm import GeminiClient


class GeminiPlanGenerator(LlmBackedPlanGenerator):
    generator_name = "gemini"

    def __init__(self, client: GeminiClient | None = None) -> None:
        super().__init__(client or GeminiClient())
