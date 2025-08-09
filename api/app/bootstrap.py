import asyncio
import uuid
from passlib.context import CryptContext

from .db import init_pool, close_pool, get_connection
from .security import hash_password


async def bootstrap(business_name: str, owner_email: str, owner_password: str, currency: str = "$", timezone: str = "UTC") -> str:
    await init_pool()
    business_id = str(uuid.uuid4())
    async with get_connection(business_id) as conn:
        await conn.execute(
            "INSERT INTO business (id, name, currency, timezone) VALUES ($1,$2,$3,$4)",
            business_id, business_name, currency, timezone
        )
        user_id = await conn.fetchval(
            """
            INSERT INTO user_account (business_id, email, password_hash, role, active)
            VALUES ($1,$2,$3,'owner',true)
            RETURNING id
            """,
            business_id, owner_email, hash_password(owner_password)
        )
    await close_pool()
    return business_id


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Bootstrap a business and owner user")
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--currency", default="$")
    parser.add_argument("--timezone", default="UTC")
    args = parser.parse_args()

    bid = asyncio.run(bootstrap(args.name, args.email, args.password, args.currency, args.timezone))
    print(bid)