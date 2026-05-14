from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ResourceType(str, Enum):
    VIDEO = "video"
    GUIDE = "guide"
    SANDBOX = "sandbox"
    READING = "reading"


class ResourceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ResourceView(BaseModel):
    """Resource as embedded inside a learning unit. Excludes internal columns."""

    type: ResourceType
    title: str
    url: str
    description: str | None = None
    duration_minutes: int | None = Field(default=None, ge=0)
    source: str | None = None
    language: str = "es"
    level: ResourceLevel | None = None

    model_config = ConfigDict(from_attributes=True)
