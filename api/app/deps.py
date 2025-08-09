from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .security import decode_access_token
from .db import get_connection

http_bearer = HTTPBearer(auto_error=False)


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer)):
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_access_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = {
        "user_id": payload.get("sub"),
        "business_id": payload.get("biz"),
        "role": payload.get("role"),
    }
    if not user["user_id"] or not user["role"]:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return user


async def get_tenant_connection(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    if not business_id:
        raise HTTPException(status_code=400, detail="Tenant context required for this endpoint")
    async with get_connection(business_id) as conn:
        yield conn


def require_role(*roles: str):
    async def role_checker(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker