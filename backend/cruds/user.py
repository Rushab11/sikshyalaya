from typing import Any, Dict, Optional, Union

from fastapi import HTTPException
from sqlalchemy.orm import Session

from core.config import settings
from core.permission.permission import check_permission
from core.security import get_password_hash, verify_password
from cruds.base import CRUDBase
from cruds.group import crud_group
from cruds.user_permission import crud_user_permission
from models.user import User
from schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    # @check_permission
    def get_by_email_test(
        self,
        db: Session,
        *,
        email: str,
    ) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_id(self, db: Session, *, id: id) -> Optional[User]:
        return db.query(User).filter(User.id == id).first()

    def create(
        self,
        db: Session,
        *,
        obj_in: UserCreate,
    ) -> User:
        if obj_in.teacher_group:
            teacher_group = list(
                map(lambda id: crud_group.get(db=db, id=id), obj_in.teacher_group)
            )
        else:
            teacher_group = []

        if obj_in.permission:
            permission = list(
                map(
                    lambda id: crud_user_permission.get(db=db, id=id), obj_in.permission
                )
            )
        else:
            permission = []

        db_obj = User(
            email=obj_in.email,  # noqa
            hashed_password=get_password_hash(obj_in.password),  # noqa
            full_name=obj_in.full_name,  # noqa
            dob=obj_in.dob,  # noqa
            teacher_group=teacher_group,  # noqa
            group_id=obj_in.group_id,  # noqa
            user_type=obj_in.user_type,  # noqa
            contact_number=obj_in.contact_number,  # noqa
            address=obj_in.address,  # noqa
            permission=permission,  # noqa
            join_year=obj_in.join_year,  # noqa
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]],
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        if (
            update_data.get("permissions")
            and db_obj.user_type > settings.UserType.ADMIN.value
        ):
            raise HTTPException(401, detail="Error ID: 136")  # Request denied
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        if user.user_type == settings.UserType.SUPERADMIN.value:
            return True
        else:
            return False


crud_user = CRUDUser(User)
