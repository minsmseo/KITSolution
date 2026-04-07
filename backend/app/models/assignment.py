import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.postgres import Base


class AssignmentGeneration(Base):
    __tablename__ = "assignment_generations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lecture_id: Mapped[str] = mapped_column(String, ForeignKey("lectures.id"))
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    selected_keywords: Mapped[list] = mapped_column(JSON, default=list)
    generated_text: Mapped[str] = mapped_column(Text)
    assignment_type: Mapped[str] = mapped_column(String(50), default="short_answer")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_generation_id: Mapped[str] = mapped_column(String, ForeignKey("assignment_generations.id"))
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    lecture_id: Mapped[str] = mapped_column(String, ForeignKey("lectures.id"))
    answer_text: Mapped[str] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
