import enum
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SkillLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class JobDescriptionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    skills: dict[str, SkillLevel] = Field(min_length=1)


class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    description: str
    skills: dict[str, SkillLevel]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
