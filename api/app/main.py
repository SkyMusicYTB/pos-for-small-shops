from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.extension import _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse

from .settings import settings
from .db import init_pool, close_pool
from .routers import auth, products, sales, reports, alerts, users, admin

app = FastAPI(title="POS API", version="0.1.0")
from .openapi_overrides import custom_openapi
app.openapi = lambda: custom_openapi(app)  # type: ignore

from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)  # type: ignore
app.state.limiter = limiter
app.add_exception_handler(Exception, lambda r, e: JSONResponse({"detail": str(e)}, status_code=500))
from slowapi.errors import RateLimitExceeded
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(reports.router)
app.include_router(alerts.router)
app.include_router(users.router)
app.include_router(admin.router)


@app.on_event("startup")
async def on_startup():
    # Apply migrations against Supabase Postgres
    from .migrator import apply_migrations
    await apply_migrations()
    await init_pool()
    # Ensure global admin exists (skymusicro@gmail.com)
    from .bootstrap import ensure_global_admin
    await ensure_global_admin("skymusicro@gmail.com", "JindeILoveYou")


@app.on_event("shutdown")
async def on_shutdown():
    await close_pool()