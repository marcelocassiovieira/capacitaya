from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserUpdate


def find_all(db: Session, offset: int = 0, limit: int = 100) -> list[User]:
    statement = select(User).offset(offset).limit(limit).order_by(User.id)
    return list(db.scalars(statement).all())


def find_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def find_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.scalar(statement)


def create(db: Session, data: UserCreate) -> User:
    user = User(**data.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update(db: Session, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
