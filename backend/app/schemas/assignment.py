from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class AssignmentType(str, Enum):
    short_answer = "short_answer"
    concept_explanation = "concept_explanation"
    compare_contrast = "compare_contrast"
    summary = "summary"
    mini_quiz = "mini_quiz"


class AssignmentGenerateRequest(BaseModel):
    selected_keywords: list[str]
    assignment_type: AssignmentType = AssignmentType.short_answer
    difficulty: Optional[str] = "medium"


class AssignmentGenerationOut(BaseModel):
    id: str
    lecture_id: str
    student_id: str
    selected_keywords: list[str]
    generated_text: str
    assignment_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmitRequest(BaseModel):
    answer_text: str


class SubmissionOut(BaseModel):
    id: str
    assignment_generation_id: str
    student_id: str
    lecture_id: str
    answer_text: str
    submitted_at: datetime

    model_config = {"from_attributes": True}
