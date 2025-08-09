from fastapi import APIRouter, Depends

from ..deps import get_tenant_connection, get_current_user

router = APIRouter(prefix="/users", tags=["users"]) 


@router.get("/me")
async def me(user=Depends(get_current_user)):
    if user.get("business_id"):
        from ..db import get_connection
        async with get_connection(user["business_id"]) as conn:
            biz = await conn.fetchrow("SELECT id, name, currency, timezone, tax_default_enabled FROM business WHERE id = current_setting('app.current_business')::uuid")
            return {
                "user": user,
                "business": dict(biz) if biz else None,
            }
    return {"user": user, "business": None}