from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.assignment import AssignmentGeneration, Submission
from app.models.lecture import Lecture
from app.models.user import User
from app.schemas.assignment import AssignmentGenerateRequest, AssignmentGenerationOut, SubmitRequest, SubmissionOut
from app.utils.gemini import generate_assignment
from app.services.kg_service import _load_lecture_text


async def generate_student_assignment(
    lecture_id: str,
    data: AssignmentGenerateRequest,
    student: User,
    db: AsyncSession,
) -> AssignmentGenerationOut:
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    if not data.selected_keywords:
        raise HTTPException(status_code=400, detail="Select at least one keyword")

    # Load lecture text for context
    text = ""
    if lecture.source_text_gcs_path:
        text = _load_lecture_text(lecture.source_text_gcs_path)

    generated_text = await generate_assignment(
        lecture_title=lecture.title,
        lecture_text_excerpt=text,
        selected_keywords=data.selected_keywords,
        assignment_type=data.assignment_type.value,
        difficulty=data.difficulty or "medium",
    )

    record = AssignmentGeneration(
        lecture_id=lecture_id,
        student_id=student.id,
        selected_keywords=data.selected_keywords,
        generated_text=generated_text,
        assignment_type=data.assignment_type.value,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return AssignmentGenerationOut.model_validate(record)


async def list_student_assignments(lecture_id: str, student: User, db: AsyncSession) -> list[AssignmentGenerationOut]:
    result = await db.execute(
        select(AssignmentGeneration)
        .where(
            AssignmentGeneration.lecture_id == lecture_id,
            AssignmentGeneration.student_id == student.id,
        )
        .order_by(AssignmentGeneration.created_at.desc())
    )
    records = result.scalars().all()
    return [AssignmentGenerationOut.model_validate(r) for r in records]


async def submit_assignment(
    assignment_id: str,
    data: SubmitRequest,
    student: User,
    db: AsyncSession,
) -> SubmissionOut:
    result = await db.execute(
        select(AssignmentGeneration).where(AssignmentGeneration.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.student_id != student.id:
        raise HTTPException(status_code=403, detail="This is not your assignment")

    if not data.answer_text or not data.answer_text.strip():
        raise HTTPException(status_code=400, detail="Answer text cannot be empty")

    # Check if already submitted
    existing = await db.execute(
        select(Submission).where(Submission.assignment_generation_id == assignment_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Assignment already submitted")

    submission = Submission(
        assignment_generation_id=assignment_id,
        student_id=student.id,
        lecture_id=assignment.lecture_id,
        answer_text=data.answer_text,
    )
    db.add(submission)
    await db.flush()
    await db.refresh(submission)
    return SubmissionOut.model_validate(submission)
