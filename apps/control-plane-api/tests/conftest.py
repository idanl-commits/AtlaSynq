"""Pytest fixtures for control-plane-api. Uses sqlite + transactional rollback."""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

os.environ["CP_DATABASE_URL"] = "sqlite:///./test_control_plane.db"
os.environ["CP_JWT_SECRET"] = "test-jwt-secret"


@pytest.fixture(scope="function")
def db_session():
    """Create tables, yield session, rollback after test."""
    from database.connection import Base, engine, SessionLocal
    from database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db_session):
    """TestClient with overridden get_db."""
    from main import app
    from database.connection import get_db

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
