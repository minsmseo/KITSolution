from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.assignment import (
    AssignmentGenerateRequest,
    AssignmentGenerationOut,
    SubmitRequest,
    SubmissionOut,
)
from app.auth.middleware import get_current_user  # noqa: F811 (re-imported below)
from app.models.assignment import AssignmentGeneration, Submission
from app.services.assignment_service import (
    generate_student_assignment,
    list_student_assignments,
    submit_assignment,
)

from app.auth.middleware import get_current_user, require_instructor  # noqa: F811

router = APIRouter(tags=["assignments"])


@router.get("/lectures/{lecture_id}/instructor/students", response_model=list[dict])
async def instructor_student_assignments(
    lecture_id: str,
    instructor: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    """강사용: 강의 수강생별 과제 생성·제출 내역"""
    from sqlalchemy import select as sa_select
    from app.models.user import User as UserModel
    from app.models.lecture import Enrollment

    # enrolled students
    enrolled = await db.execute(
        sa_select(UserModel)
        .join(Enrollment, Enrollment.student_id == UserModel.id)
        .where(Enrollment.lecture_id == lecture_id)
    )
    students = enrolled.scalars().all()

    result = []
    for s in students:
        # assignments
        agen = await db.execute(
            sa_select(AssignmentGeneration)
            .where(AssignmentGeneration.lecture_id == lecture_id,
                   AssignmentGeneration.student_id == s.id)
            .order_by(AssignmentGeneration.created_at.desc())
        )
        assignments = agen.scalars().all()

        # submissions (keyed by assignment_generation_id)
        subs_q = await db.execute(
            sa_select(Submission)
            .where(Submission.lecture_id == lecture_id,
                   Submission.student_id == s.id)
            .order_by(Submission.submitted_at.desc())
        )
        submissions = subs_q.scalars().all()
        subs_by_aid = {sub.assignment_generation_id: sub for sub in submissions}

        result.append({
            "student_id": s.id,
            "student_name": s.name,
            "student_email": s.email,
            "assignments": [
                {
                    "id": a.id,
                    "assignment_type": a.assignment_type,
                    "selected_keywords": a.selected_keywords,
                    "generated_text": a.generated_text,
                    "created_at": a.created_at.isoformat(),
                    "submission": (
                        {
                            "id": subs_by_aid[a.id].id,
                            "answer_text": subs_by_aid[a.id].answer_text,
                            "submitted_at": subs_by_aid[a.id].submitted_at.isoformat(),
                        }
                        if a.id in subs_by_aid else None
                    ),
                }
                for a in assignments
            ],
        })
    return result


@router.post("/lectures/{lecture_id}/assignments/generate", response_model=AssignmentGenerationOut, status_code=201)
async def generate_assignment_route(
    lecture_id: str,
    data: AssignmentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await generate_student_assignment(lecture_id, data, current_user, db)


@router.get("/lectures/{lecture_id}/assignments", response_model=list[AssignmentGenerationOut])
async def list_assignments_route(
    lecture_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_student_assignments(lecture_id, current_user, db)


@router.post("/assignments/{assignment_id}/submit", response_model=SubmissionOut, status_code=201)
async def submit_route(
    assignment_id: str,
    data: SubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await submit_assignment(assignment_id, data, current_user, db)
