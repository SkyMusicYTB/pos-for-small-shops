from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from ..deps import get_current_user, require_role
from ..db import get_connection

router = APIRouter(prefix="/admin", tags=["admin"]) 


@router.post("/businesses")
async def create_business(name: str, currency: str = "$", timezone: str = "UTC", user=Depends(require_role("admin"))):
    import uuid
    new_id = str(uuid.uuid4())
    async with get_connection(new_id) as conn:
        row = await conn.fetchrow(
            "INSERT INTO business (id, name, currency, timezone) VALUES ($1,$2,$3,$4) RETURNING id, name, currency, timezone, created_at",
            new_id, name, currency, timezone
        )
        return dict(row)


@router.post("/users")
async def create_user(email: str, password: str, role: str = "manager", business_id: Optional[str] = None, user=Depends(require_role("admin"))):
    from ..security import hash_password
    async with get_connection(business_id) as conn:
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO user_account (business_id, email, password_hash, role, active)
                VALUES ($1,$2,$3,$4,true)
                RETURNING id, business_id, email, role, active, created_at
                """,
                business_id, email, hash_password(password), role
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        return dict(row)


@router.get("/audit")
async def list_audit(business_id: Optional[str] = None, limit: int = Query(100, le=500), user=Depends(require_role("admin"))):
    async with get_connection(business_id) as conn:
        rows = await conn.fetch(
            "SELECT id, business_id, user_id, action, entity, entity_id, payload, created_at FROM audit_log ORDER BY created_at DESC LIMIT $1",
            limit
        )
        return [dict(r) for r in rows]