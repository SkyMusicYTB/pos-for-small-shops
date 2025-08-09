from fastapi.openapi.utils import get_openapi
from fastapi import FastAPI

def custom_openapi(app: FastAPI):
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description="POS API for multi-tenant small shops",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema