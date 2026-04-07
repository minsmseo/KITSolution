from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from datetime import datetime


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}
