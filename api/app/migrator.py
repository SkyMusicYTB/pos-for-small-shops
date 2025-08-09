import os
import asyncio
import asyncpg
from typing import List

from .settings import settings

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "migrations")


async def apply_migrations() -> None:
    # Ensure migrations table, then apply any .sql files not yet applied
    conn = await asyncpg.connect(dsn=settings.database_url)
    try:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
              filename TEXT PRIMARY KEY,
              applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
        # Collect migrations
        files: List[str] = []
        if os.path.isdir(MIGRATIONS_DIR):
            for name in sorted(os.listdir(MIGRATIONS_DIR)):
                if name.endswith(".sql"):
                    files.append(name)
        for fname in files:
            row = await conn.fetchrow("SELECT 1 FROM schema_migrations WHERE filename=$1", fname)
            if row:
                continue
            with open(os.path.join(MIGRATIONS_DIR, fname), "r", encoding="utf-8") as f:
                sql = f.read()
            await conn.execute(sql)
            await conn.execute("INSERT INTO schema_migrations (filename) VALUES ($1)", fname)
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(apply_migrations())