from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules.job_descriptions.models import SkillLevel


class UserSkillCreate(BaseModel):
    skill_id: int
    level: SkillLevel


class UserSkillResponse(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    level: SkillLevel
    created_at: datetime

    model_config = ConfigDict(from_attributes=False)
