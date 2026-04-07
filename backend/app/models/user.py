import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.postgres import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    instructor = "instructor"
    student = "student"
    manager = "manager"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.student)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
