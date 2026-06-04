from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.skills import service
from app.modules.skills.schemas import SkillCreate, SkillResponse

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillResponse])
def search_skills(
    q: str = Query(default="", max_length=200),
    db: Session = Depends(get_db),
) -> list[SkillResponse]:
    return service.search(db, q)


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    payload: SkillCreate,
    response: Response,
    db: Session = Depends(get_db),
) -> SkillResponse:
    skill, created = service.get_or_create(db, payload)
    if not created:
        response.status_code = status.HTTP_200_OK
    return skill
