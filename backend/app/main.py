from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.postgres import init_db
from app.db.neo4j_db import close_driver
from app.api.routes import auth, lectures, graph, assignments, analytics, admin
import structlog

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RevMap API")
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error("DB init failed (will retry on first request)", error=str(e))
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lectures.router)
app.include_router(graph.router)
app.include_router(assignments.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "RevMap API"}
