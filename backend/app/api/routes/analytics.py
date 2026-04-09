from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.auth.middleware import require_manager
from app.models.user import User
from app.services.analytics_service import (
    get_all_analytics,
    get_instructor_analytics,
    get_lecture_participation,
    get_lecture_student_analytics,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/instructors")
async def all_instructors_analytics(
    manager: User = Depends(require_manager),
    db: AsyncSession = Depends(get_db),
):
    return await get_all_analytics(db)


@router.get("/instructors/{instructor_id}")
async def instructor_analytics(
    instructor_id: str,
    manager: User = Depends(require_manager),
    db: AsyncSession = Depends(get_db),
):
    return await get_instructor_analytics(instructor_id, db)


@router.get("/lectures/{lecture_id}")
async def lecture_analytics(
    lecture_id: str,
    manager: User = Depends(require_manager),
    db: AsyncSession = Depends(get_db),
):
    return await get_lecture_participation(lecture_id, db)


@router.get("/lectures/{lecture_id}/students")
async def lecture_students_analytics(
    lecture_id: str,
    manager: User = Depends(require_manager),
    db: AsyncSession = Depends(get_db),
):
    return await get_lecture_student_analytics(lecture_id, db)
