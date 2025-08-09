from fastapi import APIRouter, Depends

from ..deps import get_tenant_connection, get_current_user

router = APIRouter(prefix="/users", tags=["users"]) 


@router.get("/me")
async def me(conn=Depends(get_tenant_connection), user=Depends(get_current_user)):
    biz = await conn.fetchrow("SELECT id, name, currency, timezone, tax_default_enabled FROM business WHERE id = current_setting('app.current_business')::uuid")
    return {
        "user": user,
        "business": dict(biz) if biz else None,
    }