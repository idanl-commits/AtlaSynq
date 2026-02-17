# Phase 1A — Monorepo Scaffolding PR

## Summary

Minimal scaffolding for monorepo structure and control-plane services. No runtime changes, no nginx routing, no auth, no DB.

---

## PR Breakdown

### 1. New Folders

| Path | Purpose |
|------|---------|
| `apps/control-plane-api/` | FastAPI service (orgs, users, workspaces — future) |
| `apps/control-plane-web/` | Next.js app (signup, login, dashboards — future) |
| `packages/shared-types/` | Shared Pydantic/JSON schemas (placeholder) |

### 2. control-plane-api

- **main.py**: FastAPI app with `/health` and `/` endpoints only
- **requirements.txt**: fastapi, uvicorn
- **Dockerfile**: Python 3.11-slim, port 8100, curl for healthcheck
- **README.md**: Scaffolding note

### 3. control-plane-web

- **package.json**: Next.js 14, React 18
- **next.config.js**: standalone output for Docker
- **app/layout.js**, **app/page.js**: Simple homepage
- **Dockerfile**: Multi-stage Node build
- **README.md**: Scaffolding note

### 4. packages/shared-types

- **pyproject.toml**: Placeholder package config
- **shared_types/__init__.py**: Empty module
- **README.md**: Placeholder note

### 5. Docker Compose

- **docker-compose.yml**: Added `control-plane-api` service (port 8100)
- **infra/docker/compose.staging.yml**: Added `control-plane-api` env_file override

---

## Acceptance Checklist

- [ ] `apps/control-plane-api/` exists with FastAPI `/health` endpoint
- [ ] `apps/control-plane-web/` exists with Next.js simple homepage
- [ ] `packages/shared-types/` exists as placeholder
- [ ] `docker compose config` validates
- [ ] `docker compose build control-plane-api` succeeds
- [ ] `docker compose up -d` starts all services including control-plane-api
- [ ] `curl http://localhost:8100/health` returns `{"status":"healthy","service":"control-plane-api"}`
- [ ] `curl http://localhost:8000/health` (governance-engine) unchanged
- [ ] `curl http://localhost:3080/` (LibreChat via nginx) unchanged
- [ ] No changes to `platform/governance-engine`
- [ ] No changes to `platform/nginx`
- [ ] No changes to LibreChat config
- [ ] All FEATURE_* flags remain OFF (no logic changes)

---

## Runtime Verification

```bash
# From repo root
docker compose up -d
sleep 15
curl -s http://localhost:8100/health    # control-plane-api
curl -s http://localhost:8000/health    # governance-engine
curl -s http://localhost:3080/ | head -5 # nginx → LibreChat
docker compose down
```
