from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole


class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student


class ChangeRoleRequest(BaseModel):
    role: UserRole


class CreateLectureAdminRequest(BaseModel):
    title: str
    description: Optional[str] = None
    instructor_id: str


class ReassignInstructorRequest(BaseModel):
    instructor_id: str
