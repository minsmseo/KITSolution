from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.lecture import LectureCreate, LectureOut, TextUploadRequest, EnrollRequest
from app.services.lecture_service import (
    create_lecture,
    list_lectures,
    get_lecture,
    upload_lecture_text,
    enroll_student,
    get_enrolled_students,
)
from app.auth.middleware import get_current_user, require_instructor

router = APIRouter(prefix="/lectures", tags=["lectures"])


@router.get("", response_model=list[LectureOut])
async def list_lectures_route(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_lectures(current_user, db)


@router.post("", response_model=LectureOut, status_code=201)
async def create_lecture_route(
    data: LectureCreate,
    instructor: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    return await create_lecture(data, instructor, db)


@router.get("/{lecture_id}")
async def get_lecture_route(
    lecture_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lecture = await get_lecture(lecture_id, db)
    return LectureOut.model_validate(lecture)


@router.post("/{lecture_id}/upload-text")
async def upload_text_route(
    lecture_id: str,
    data: TextUploadRequest,
    background_tasks: BackgroundTasks,
    instructor: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    return await upload_lecture_text(lecture_id, data, instructor, db, background_tasks)


@router.post("/{lecture_id}/enroll")
async def enroll_route(
    lecture_id: str,
    data: EnrollRequest,
    current_user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    return await enroll_student(lecture_id, data.student_id, db)


@router.post("/{lecture_id}/enroll-self")
async def enroll_self_route(
    lecture_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await enroll_student(lecture_id, current_user.id, db)


@router.get("/{lecture_id}/students")
async def get_students_route(
    lecture_id: str,
    current_user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    return await get_enrolled_students(lecture_id, db)
