from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.models.user import User
from app.auth.middleware import get_current_user, require_instructor
from app.services.kg_service import trigger_graph_generation, get_graph

router = APIRouter(prefix="/lectures", tags=["graph"])


@router.post("/{lecture_id}/generate-graph")
async def generate_graph_route(
    lecture_id: str,
    instructor: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    return await trigger_graph_generation(lecture_id, instructor, db)


@router.get("/{lecture_id}/graph")
async def get_graph_route(
    lecture_id: str,
    current_user: User = Depends(get_current_user),
):
    return await get_graph(lecture_id)
