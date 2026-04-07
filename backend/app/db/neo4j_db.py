from neo4j import AsyncGraphDatabase, AsyncDriver
from app.config import get_settings

settings = get_settings()

_driver: AsyncDriver | None = None


def get_driver() -> AsyncDriver:
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _driver


async def close_driver():
    global _driver
    if _driver:
        await _driver.close()
        _driver = None


async def get_neo4j_session():
    driver = get_driver()
    async with driver.session() as session:
        yield session
