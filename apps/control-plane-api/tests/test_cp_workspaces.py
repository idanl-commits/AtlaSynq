"""Tests for workspace CRUD."""
import pytest


def _auth_headers(client):
    r = client.post("/api/cp/signup", json={"full_name": "WS User", "email": "ws@example.com", "password": "pass"})
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_workspace(client):
    h = _auth_headers(client)
    r = client.post("/api/cp/workspaces", json={"name": "My Workspace"}, headers=h)
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "My Workspace"
    assert "id" in data
    assert "org_id" in data


def test_list_workspaces(client):
    h = _auth_headers(client)
    client.post("/api/cp/workspaces", json={"name": "A"}, headers=h)
    client.post("/api/cp/workspaces", json={"name": "B"}, headers=h)
    r = client.get("/api/cp/workspaces", headers=h)
    assert r.status_code == 200
    workspaces = r.json()
    assert len(workspaces) >= 2
    names = [w["name"] for w in workspaces]
    assert "A" in names and "B" in names


def test_list_workspaces_requires_auth(client):
    r = client.get("/api/cp/workspaces")
    assert r.status_code == 401


def test_create_workspace_requires_auth(client):
    r = client.post("/api/cp/workspaces", json={"name": "X"})
    assert r.status_code == 401
