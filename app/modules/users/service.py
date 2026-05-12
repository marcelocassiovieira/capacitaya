from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.users import repository
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserUpdate


def list_users(db: Session, offset: int = 0, limit: int = 100) -> list[User]:
    return repository.find_all(db, offset=offset, limit=limit)


def get_user(db: Session, user_id: int) -> User:
    user = repository.find_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def create_user(db: Session, data: UserCreate) -> User:
    if repository.find_by_email(db, data.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    return repository.create(db, data)


def update_user(db: Session, user_id: int, data: UserUpdate) -> User:
    user = get_user(db, user_id)
    if data.email is not None:
        existing_user = repository.find_by_email(db, data.email)
        if existing_user is not None and existing_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    return repository.update(db, user, data)


def delete_user(db: Session, user_id: int) -> None:
    user = get_user(db, user_id)
    repository.delete(db, user)
