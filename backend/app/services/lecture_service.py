from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, BackgroundTasks
from app.models.lecture import Lecture, Enrollment, GraphStatus
from app.models.user import User, UserRole
from app.schemas.lecture import LectureCreate, LectureOut, TextUploadRequest
from app.config import get_settings
import uuid

settings = get_settings()


async def create_lecture(data: LectureCreate, instructor: User, db: AsyncSession) -> LectureOut:
    lecture = Lecture(title=data.title, description=data.description, instructor_id=instructor.id)
    db.add(lecture)
    await db.flush()
    await db.refresh(lecture)
    return LectureOut.model_validate(lecture)


async def list_lectures(current_user: User, db: AsyncSession) -> list[LectureOut]:
    if current_user.role in (UserRole.admin, UserRole.manager):
        result = await db.execute(select(Lecture).order_by(Lecture.created_at.desc()))
        lectures = result.scalars().all()
    elif current_user.role == UserRole.instructor:
        result = await db.execute(
            select(Lecture).where(Lecture.instructor_id == current_user.id).order_by(Lecture.created_at.desc())
        )
        lectures = result.scalars().all()
    else:  # student
        result = await db.execute(
            select(Lecture)
            .join(Enrollment, Enrollment.lecture_id == Lecture.id)
            .where(Enrollment.student_id == current_user.id)
            .order_by(Lecture.created_at.desc())
        )
        lectures = result.scalars().all()
    return [LectureOut.model_validate(l) for l in lectures]


async def get_lecture(lecture_id: str, db: AsyncSession) -> Lecture:
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return lecture


async def upload_lecture_text(
    lecture_id: str,
    data: TextUploadRequest,
    instructor: User,
    db: AsyncSession,
    background_tasks: BackgroundTasks,
) -> dict:
    lecture = await get_lecture(lecture_id, db)

    if lecture.instructor_id != instructor.id and instructor.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not your lecture")

    if not data.text or not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if len(data.text) > settings.MAX_LECTURE_TEXT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Text exceeds maximum length of {settings.MAX_LECTURE_TEXT_LENGTH} characters",
        )

    # Upload to GCS
    blob_name = f"lectures/{lecture_id}/source_{uuid.uuid4().hex}.txt"
    try:
        from app.db.gcs import upload_text
        gcs_path = upload_text(data.text, blob_name)
        lecture.source_text_gcs_path = blob_name
    except Exception:
        # Fallback: store inline (for development without GCS)
        lecture.source_text_gcs_path = f"inline:{data.text[:500]}"

    lecture.graph_status = GraphStatus.pending
    await db.flush()

    return {"message": "Text uploaded successfully", "lecture_id": lecture_id}


async def enroll_student(lecture_id: str, student_id: str, db: AsyncSession):
    lecture = await get_lecture(lecture_id, db)

    result = await db.execute(
        select(Enrollment).where(
            Enrollment.lecture_id == lecture_id,
            Enrollment.student_id == student_id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = Enrollment(lecture_id=lecture_id, student_id=student_id)
    db.add(enrollment)
    await db.flush()
    return {"message": "Enrolled successfully"}


async def get_enrolled_students(lecture_id: str, db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(User)
        .join(Enrollment, Enrollment.student_id == User.id)
        .where(Enrollment.lecture_id == lecture_id)
    )
    students = result.scalars().all()
    return [{"id": s.id, "name": s.name, "email": s.email} for s in students]
