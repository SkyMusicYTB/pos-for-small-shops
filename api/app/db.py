import asyncio
import asyncpg
from contextlib import asynccontextmanager
from typing import AsyncIterator

from .settings import settings

_pool: asyncpg.Pool | None = None


async def init_pool() -> None:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(dsn=settings.database_url, min_size=1, max_size=10)


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


@asynccontextmanager
async def get_connection(business_id: str | None = None) -> AsyncIterator[asyncpg.Connection]:
    assert _pool is not None, "DB pool not initialized"
    async with _pool.acquire() as conn:
        try:
            if business_id:
                # Parameterize via set_config, LOCAL scope
                await conn.execute("SELECT set_config('app.current_business', $1, true)", business_id)
            yield conn
        finally:
            # Ensure we do not leak tenant across pooled connections
            await conn.execute("RESET app.current_business")


async def run_migrations_check(conn: asyncpg.Connection) -> None:
    await conn.execute("""
        SELECT 1
    """)