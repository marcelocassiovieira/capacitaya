from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.modules.learning_paths.schemas import GapReport, StoredLearningPath


class GapAnalysisInputs(BaseModel):
    student_email: EmailStr
    company_email: EmailStr


class GapAnalysisFromSkillsCreate(BaseModel):
    student_email: EmailStr
    job_description_id: int


class GapAnalysisResponse(BaseModel):
    id: int
    student_email: EmailStr
    company_email: EmailStr
    readiness_score: int
    summary: str
    gap_report: GapReport
    learning_path_id: int | None
    generator_used: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GapAnalysisWithPlanResponse(BaseModel):
    gap_analysis: GapAnalysisResponse
    learning_path: StoredLearningPath
