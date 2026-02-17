"""Tests for signup, login, me."""
import pytest


def test_signup_returns_token(client):
    r = client.post("/api/cp/signup", json={"full_name": "Test User", "email": "test@example.com", "password": "secret123"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 20


def test_signup_duplicate_email_fails(client):
    client.post("/api/cp/signup", json={"full_name": "A", "email": "dup@example.com", "password": "secret123"})
    r = client.post("/api/cp/signup", json={"full_name": "B", "email": "dup@example.com", "password": "other"})
    assert r.status_code == 400
    assert "already" in r.json()["detail"].lower()


def test_login_returns_token(client):
    client.post("/api/cp/signup", json={"full_name": "Login User", "email": "login@example.com", "password": "mypass"})
    r = client.post("/api/cp/login", json={"email": "login@example.com", "password": "mypass"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password_fails(client):
    client.post("/api/cp/signup", json={"full_name": "X", "email": "wrong@example.com", "password": "correct"})
    r = client.post("/api/cp/login", json={"email": "wrong@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_me_returns_user(client):
    signup = client.post("/api/cp/signup", json={"full_name": "Me User", "email": "me@example.com", "password": "x"})
    token = signup.json()["access_token"]
    r = client.get("/api/cp/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "me@example.com"
    assert data["full_name"] == "Me User"


def test_me_without_token_fails(client):
    r = client.get("/api/cp/me")
    assert r.status_code == 401
