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
from app.auth.middleware import get_current_user
from app.services.assignment_service import (
    generate_student_assignment,
    list_student_assignments,
    submit_assignment,
)

router = APIRouter(tags=["assignments"])


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
