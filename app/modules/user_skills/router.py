from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_skills import service
from app.modules.user_skills.schemas import UserSkillCreate, UserSkillResponse

router = APIRouter(prefix="/students", tags=["user-skills"])


@router.get("/{email}/skills", response_model=list[UserSkillResponse])
def list_skills(email: str, db: Session = Depends(get_db)) -> list[UserSkillResponse]:
    return service.list_for_user(db, email)


@router.post(
    "/{email}/skills",
    response_model=UserSkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_skill(
    email: str, payload: UserSkillCreate, db: Session = Depends(get_db)
) -> UserSkillResponse:
    return service.add_skill(db, email, payload)


@router.delete("/{email}/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_skill(email: str, skill_id: int, db: Session = Depends(get_db)) -> None:
    service.remove_skill(db, email, skill_id)
