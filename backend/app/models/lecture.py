import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Enum as SAEnum, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.postgres import Base
import enum


class GraphStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Lecture(Base):
    __tablename__ = "lectures"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    instructor_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    source_text_gcs_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    graph_status: Mapped[GraphStatus] = mapped_column(SAEnum(GraphStatus), default=GraphStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lecture_id: Mapped[str] = mapped_column(String, ForeignKey("lectures.id"))
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
