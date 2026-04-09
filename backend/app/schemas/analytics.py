from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LectureParticipation(BaseModel):
    lecture_id: str
    lecture_title: str
    total_students: int
    participating_students: int
    participation_rate: float
    total_assignments_generated: int
    total_submissions: int


class InstructorAnalytics(BaseModel):
    instructor_id: str
    instructor_name: str
    instructor_email: str
    lectures: list[LectureParticipation]
    total_students: int
    total_participating: int
    overall_participation_rate: float


class AnalyticsSummary(BaseModel):
    instructors: list[InstructorAnalytics]


class StudentEngagement(BaseModel):
    student_id: str
    student_name: str
    student_email: str
    assignments_generated: int
    submissions: int
    last_activity: Optional[datetime] = None
    engagement_level: str  # "high" | "medium" | "low" | "none"


class LectureStudentAnalytics(BaseModel):
    lecture_id: str
    lecture_title: str
    total_students: int
    students: list[StudentEngagement]
