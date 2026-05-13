import json
from typing import Any

import google.generativeai as genai

from app.config import settings


class LlmConfigurationError(RuntimeError):
    pass


class LlmResponseError(RuntimeError):
    pass


class GeminiClient:
    def __init__(
        self,
        api_key: str | None = None,
        model_name: str | None = None,
    ) -> None:
        key = api_key or settings.gemini_api_key
        if not key:
            raise LlmConfigurationError(
                "GEMINI_API_KEY is not set; cannot instantiate GeminiClient."
            )
        genai.configure(api_key=key)
        self._model_name = model_name or settings.gemini_model

    def generate_json(
        self,
        prompt: str,
        response_schema: dict[str, Any],
        temperature: float = 0.7,
    ) -> dict[str, Any]:
        model = genai.GenerativeModel(self._model_name)
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": response_schema,
                "temperature": temperature,
            },
        )
        try:
            return json.loads(response.text)
        except (ValueError, AttributeError) as exc:
            raise LlmResponseError(
                f"Gemini returned a non-JSON response: {response!r}"
            ) from exc
