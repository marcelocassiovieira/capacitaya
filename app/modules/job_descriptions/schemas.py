from datetime import datetime

from pydantic import BaseModel, Field

from app.modules.job_descriptions.models import SkillLevel


class SkillRequirementIn(BaseModel):
    skill_id: int = Field(ge=1)
    level: SkillLevel


class SkillRequirementOut(BaseModel):
    skill_id: int
    skill_name: str
    level: SkillLevel


class PostedByResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str


class JobDescriptionCreate(BaseModel):
    user_id: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(min_length=1)
    province: str = Field(min_length=1, max_length=100)
    required_skills: list[SkillRequirementIn] = Field(min_length=1)


class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    description: str
    province: str
    posted_by: PostedByResponse
    required_skills: list[SkillRequirementOut]
    created_at: datetime
