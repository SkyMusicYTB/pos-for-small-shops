from fastapi import APIRouter, Depends, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

from ..db import get_connection
from ..models import LoginRequest, TokenPair, RefreshRequest, UserOut
from ..security import verify_password, create_access_token, create_refresh_token, decode_refresh_token
from ..settings import settings

router = APIRouter(prefix="/auth", tags=["auth"])

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_minute}/minute"])  # type: ignore


@router.post("/login", response_model=TokenPair)
@limiter.limit("10/minute")  # type: ignore
async def login(req: Request, payload: LoginRequest):
    async with get_connection(None) as conn:
        row = await conn.fetchrow(
            "SELECT * FROM app_get_users_by_email($1) LIMIT 1",
            payload.email,
        )
        if not row or not row["active"]:
            raise HTTPException(status_code=400, detail="Invalid credentials")
        if not verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=400, detail="Invalid credentials")
        access = create_access_token({"sub": str(row["id"]), "biz": str(row["business_id"]), "role": row["role"]})
        refresh = create_refresh_token({"sub": str(row["id"]), "biz": str(row["business_id"]), "role": row["role"]})
        return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair)
async def refresh_token(payload: RefreshRequest):
    try:
        data = decode_refresh_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise ValueError("not refresh")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access = create_access_token({"sub": data.get("sub"), "biz": data.get("biz"), "role": data.get("role")})
    refresh = create_refresh_token({"sub": data.get("sub"), "biz": data.get("biz"), "role": data.get("role")})
    return TokenPair(access_token=access, refresh_token=refresh)