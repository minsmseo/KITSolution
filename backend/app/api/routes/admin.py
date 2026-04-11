from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sql_delete
from typing import Optional
from app.db.postgres import get_db
from app.models.user import User, UserRole
from app.models.lecture import Lecture, Enrollment
from app.models.assignment import AssignmentGeneration, Submission
from app.schemas.auth import UserOut
from app.schemas.lecture import LectureOut
from app.schemas.admin import (
    CreateUserRequest, ChangeRoleRequest,
    CreateLectureAdminRequest, ReassignInstructorRequest,
)
from app.auth.middleware import require_admin
from app.auth.jwt import hash_password

router = APIRouter(prefix="/admin", tags=["admin"])


# ── USERS ──────────────────────────────────────────────────

@router.get("/users", response_model=list[UserOut])
async def list_users(
    role: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(User).order_by(User.created_at.desc())
    if role and role != "all":
        q = q.where(User.role == role)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(
    data: CreateUserRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.patch("/users/{user_id}/role", response_model=UserOut)
async def change_user_role(
    user_id: str,
    data: ChangeRoleRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="자신의 역할은 변경할 수 없습니다")
    user.role = data.role
    await db.flush()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="자신의 계정은 삭제할 수 없습니다")

    await db.execute(sql_delete(Submission).where(Submission.student_id == user_id))
    await db.execute(sql_delete(AssignmentGeneration).where(AssignmentGeneration.student_id == user_id))
    await db.execute(sql_delete(Enrollment).where(Enrollment.student_id == user_id))
    await db.delete(user)
    await db.flush()


# ── LECTURES ──────────────────────────────────────────────

@router.get("/lectures")
async def list_all_lectures(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lecture, User)
        .join(User, User.id == Lecture.instructor_id)
        .order_by(Lecture.created_at.desc())
    )
    rows = result.all()
    return [
        {
            **LectureOut.model_validate(lec).model_dump(),
            "instructor_name": u.name,
            "instructor_email": u.email,
        }
        for lec, u in rows
    ]


@router.post("/lectures", status_code=201)
async def create_lecture_admin(
    data: CreateLectureAdminRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == data.instructor_id))
    instructor = result.scalar_one_or_none()
    if not instructor or instructor.role not in (UserRole.instructor, UserRole.admin):
        raise HTTPException(status_code=400, detail="유효한 강사가 아닙니다")

    lecture = Lecture(title=data.title, description=data.description, instructor_id=data.instructor_id)
    db.add(lecture)
    await db.flush()
    await db.refresh(lecture)
    return {
        **LectureOut.model_validate(lecture).model_dump(),
        "instructor_name": instructor.name,
        "instructor_email": instructor.email,
    }


@router.patch("/lectures/{lecture_id}/instructor")
async def reassign_instructor(
    lecture_id: str,
    data: ReassignInstructorRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    lec_result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = lec_result.scalar_one_or_none()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다")

    inst_result = await db.execute(select(User).where(User.id == data.instructor_id))
    instructor = inst_result.scalar_one_or_none()
    if not instructor or instructor.role not in (UserRole.instructor, UserRole.admin):
        raise HTTPException(status_code=400, detail="유효한 강사가 아닙니다")

    lecture.instructor_id = data.instructor_id
    await db.flush()
    return {"message": "강사가 재배정되었습니다", "instructor_name": instructor.name}


@router.delete("/lectures/{lecture_id}", status_code=204)
async def delete_lecture(
    lecture_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다")

    await db.execute(sql_delete(Submission).where(Submission.lecture_id == lecture_id))
    await db.execute(sql_delete(AssignmentGeneration).where(AssignmentGeneration.lecture_id == lecture_id))
    await db.execute(sql_delete(Enrollment).where(Enrollment.lecture_id == lecture_id))
    await db.delete(lecture)
    await db.flush()
