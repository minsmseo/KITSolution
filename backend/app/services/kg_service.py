import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.lecture import Lecture, GraphStatus
from app.models.user import User, UserRole
from app.utils.gemini import extract_knowledge_graph
from app.db.neo4j_db import get_driver
import structlog

logger = structlog.get_logger()


async def trigger_graph_generation(lecture_id: str, instructor: User, db: AsyncSession) -> dict:
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    if lecture.instructor_id != instructor.id and instructor.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not your lecture")

    if not lecture.source_text_gcs_path:
        raise HTTPException(status_code=400, detail="No lecture text uploaded yet")

    lecture.graph_status = GraphStatus.processing
    await db.flush()

    # Run graph generation (async background in prod; inline for MVP simplicity)
    try:
        text = _load_lecture_text(lecture.source_text_gcs_path)
        graph_data = await extract_knowledge_graph(text)
        await _store_graph_neo4j(lecture_id, graph_data)
        lecture.graph_status = GraphStatus.completed
    except Exception as e:
        logger.error("kg_generation_failed", lecture_id=lecture_id, error=str(e))
        lecture.graph_status = GraphStatus.failed
        await db.flush()
        raise HTTPException(status_code=500, detail=f"Graph generation failed: {str(e)}")

    await db.flush()
    return {"message": "Knowledge graph generated successfully", "lecture_id": lecture_id}


def _load_lecture_text(gcs_path: str) -> str:
    if gcs_path.startswith("inline:"):
        return gcs_path[7:]
    try:
        from app.db.gcs import download_text
        return download_text(gcs_path)
    except Exception:
        return ""


async def _store_graph_neo4j(lecture_id: str, graph_data: dict):
    driver = get_driver()
    async with driver.session() as session:
        # Clear existing graph for this lecture
        await session.run(
            "MATCH (n {lecture_id: $lid}) DETACH DELETE n",
            lid=lecture_id,
        )

        # Create nodes
        for node in graph_data.get("nodes", []):
            await session.run(
                """
                CREATE (n:KGNode {
                    node_id: $node_id,
                    lecture_id: $lecture_id,
                    label: $label,
                    type: $type,
                    description: $description
                })
                """,
                node_id=node["id"],
                lecture_id=lecture_id,
                label=node["label"],
                type=node.get("type", "Concept"),
                description=node.get("description", ""),
            )

        # Create edges
        for edge in graph_data.get("edges", []):
            await session.run(
                f"""
                MATCH (a:KGNode {{node_id: $source, lecture_id: $lid}})
                MATCH (b:KGNode {{node_id: $target, lecture_id: $lid}})
                CREATE (a)-[:{edge['relation']}]->(b)
                """,
                source=edge["source"],
                target=edge["target"],
                lid=lecture_id,
            )


async def get_graph(lecture_id: str) -> dict:
    driver = get_driver()
    async with driver.session() as session:
        node_result = await session.run(
            "MATCH (n:KGNode {lecture_id: $lid}) RETURN n",
            lid=lecture_id,
        )
        nodes = []
        async for record in node_result:
            n = record["n"]
            nodes.append({
                "id": n["node_id"],
                "label": n["label"],
                "type": n["type"],
                "description": n["description"],
            })

        edge_result = await session.run(
            """
            MATCH (a:KGNode {lecture_id: $lid})-[r]->(b:KGNode {lecture_id: $lid})
            RETURN a.node_id AS source, type(r) AS relation, b.node_id AS target
            """,
            lid=lecture_id,
        )
        edges = []
        async for record in edge_result:
            edges.append({
                "source": record["source"],
                "relation": record["relation"],
                "target": record["target"],
            })

    return {"lecture_id": lecture_id, "nodes": nodes, "edges": edges}
