"""
AtlaSynq Control Plane API — orgs, users, workspaces, policies, integrations.
Phase 1B: signup, login, me, workspaces. Uses control_plane DB (separate from runtime).
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from api.cp import router as cp_router


async def db_operational_error_handler(_request: Request, exc: OperationalError) -> JSONResponse:
    """Return 503 when DB connection fails (e.g. control_plane does not exist)."""
    detail = "Database unavailable"
    if exc.orig and "does not exist" in str(exc.orig):
        detail = (
            "control_plane database does not exist. "
            "Run: docker exec -it atlasynq-db psql -U atlasynq -d postgres -c \"CREATE DATABASE control_plane;\"; "
            "Then: cd apps/control-plane-api && alembic upgrade head"
        )
    return JSONResponse(status_code=503, content={"detail": detail})


app = FastAPI(
    title="AtlaSynq Control Plane API",
    description="Organizations, workspaces, policies, integrations",
    version="0.1.0",
)
app.add_exception_handler(OperationalError, db_operational_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cp_router)


@app.get("/health")
async def health():
    """Health check for control-plane-api."""
    return {"status": "healthy", "service": "control-plane-api"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {"service": "control-plane-api", "version": "0.1.0"}
