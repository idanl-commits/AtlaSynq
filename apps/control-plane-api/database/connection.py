"""
Control-plane database connection.
Uses CP_DATABASE_URL — must point to the control_plane database (not atlasynq_governance).
For tests, use sqlite (e.g. sqlite:///./test_cp.db).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv(
    "CP_DATABASE_URL",
    "postgresql://atlasynq:atlasynq_postgres_password@localhost:5432/control_plane",
)

if DATABASE_URL.startswith("sqlite"):
    _engine_kwargs = {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}
else:
    _engine_kwargs = {"pool_pre_ping": True, "pool_size": 5, "max_overflow": 10}

engine = create_engine(DATABASE_URL, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for FastAPI — yields session, closes on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
