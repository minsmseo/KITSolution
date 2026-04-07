from pydantic import BaseModel
from app.models.lecture import GraphStatus
from datetime import datetime
from typing import Optional


class LectureCreate(BaseModel):
    title: str
    description: Optional[str] = None


class LectureUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class LectureOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    instructor_id: str
    graph_status: GraphStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TextUploadRequest(BaseModel):
    text: str


class EnrollRequest(BaseModel):
    student_id: str
