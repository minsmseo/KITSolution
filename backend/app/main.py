from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.postgres import init_db
from app.db.neo4j_db import close_driver
from app.api.routes import auth, lectures, graph, assignments, analytics
import structlog

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RevMap API")
    await init_db()
    yield
    await close_driver()
    logger.info("RevMap API shut down")


app = FastAPI(
    title="RevMap API",
    description="Adaptive review platform API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lectures.router)
app.include_router(graph.router)
app.include_router(assignments.router)
app.include_router(analytics.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "RevMap API"}
