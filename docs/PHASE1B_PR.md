# Phase 1B — Control-Plane DB + Minimal Auth

## Summary

Add control-plane database (separate DB `control_plane`), SQLAlchemy models, Alembic migrations, minimal auth (email/password, argon2, JWT), and CP endpoints. No runtime changes, no nginx, no PEP, no request-flow wiring.

---

## PR Breakdown

### PR1: DB + Migrations

**Files added/modified**

| Path | Change |
|------|--------|
| `apps/control-plane-api/database/connection.py` | SQLAlchemy engine for `CP_DATABASE_URL` |
| `apps/control-plane-api/database/models.py` | Organization, User, Workspace, Role, Membership, EmailVerificationToken |
| `apps/control-plane-api/alembic.ini` | Alembic config |
| `apps/control-plane-api/alembic/env.py` | env.py for control-plane |
| `apps/control-plane-api/alembic/versions/001_initial_cp_schema.py` | Initial migration |
| `apps/control-plane-api/docs/control-plane-db-init.md` | One-time DB create + migration steps |
| `docker-compose.yml` | control-plane-api: `CP_DATABASE_URL`, `CP_JWT_SECRET`, `depends_on: db` |

---

### PR2: Auth + Endpoints

**Files added/modified**

| Path | Change |
|------|--------|
| `apps/control-plane-api/app/config.py` | Config from env (CP_DATABASE_URL, JWT, etc.) |
| `apps/control-plane-api/app/auth.py` | argon2 hashing, JWT encode/decode, get_current_user |
| `apps/control-plane-api/app/schemas.py` | SignupRequest, LoginRequest, TokenResponse, UserResponse, WorkspaceCreate, WorkspaceResponse |
| `apps/control-plane-api/api/cp.py` | POST signup, POST login, GET me, POST workspaces, GET workspaces |
| `apps/control-plane-api/main.py` | CP router, CORS |
| `apps/control-plane-api/requirements.txt` | sqlalchemy, psycopg2-binary, alembic, argon2-cffi, python-jose, pydantic-settings |
| `apps/control-plane-api/.env.example` | CP_DATABASE_URL, CP_JWT_SECRET, CP_JWT_ACCESS_TTL |
| `infra/env/staging.env.example` | CP_* vars (no secrets) |

---

### PR3: Tests

**Files added/modified**

| Path | Change |
|------|--------|
| `apps/control-plane-api/tests/conftest.py` | SQLite + transactional rollback, `get_db` override |
| `apps/control-plane-api/tests/test_cp_auth.py` | signup, duplicate signup, login, wrong password, me, me without token |
| `apps/control-plane-api/tests/test_cp_workspaces.py` | create workspace, list workspaces, auth required |
| `apps/control-plane-api/pytest.ini` | pytest config |
| `apps/control-plane-api/database/connection.py` | SQLite engine options for tests |

---

## File Tree Changes (Phase 1B)

```
apps/control-plane-api/
├── scripts/
│   └── run-tests.sh          # new
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
│       └── 001_initial_cp_schema.py
├── app/
│   ├── auth.py
│   ├── config.py
│   └── schemas.py
├── api/
│   └── cp.py
├── database/
│   ├── connection.py
│   └── models.py
├── tests/
│   ├── conftest.py
│   ├── test_cp_auth.py
│   └── test_cp_workspaces.py
├── main.py                    # updated
├── requirements.txt           # updated
├── .env.example               # new
└── pytest.ini                 # new

docs/
├── control-plane-db-init.md   # new
└── PHASE1B_PR.md              # new

infra/env/
└── staging.env.example        # updated
```

---

## Exact Commands to Create the New DB

```bash
# With docker compose running (db container must be up)
docker exec -it atlasynq-db psql -U atlasynq -d postgres -c "CREATE DATABASE control_plane;"
```

Then run migrations:

```bash
cd apps/control-plane-api
export CP_DATABASE_URL="postgresql://atlasynq:${POSTGRES_PASSWORD}@localhost:5432/control_plane"
alembic upgrade head
```

See `docs/control-plane-db-init.md` for full steps.

---

## Run Tests

```bash
cd apps/control-plane-api
./scripts/run-tests.sh
```

Or manually:

```bash
cd apps/control-plane-api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
CP_DATABASE_URL="sqlite:///./test_cp.db" CP_JWT_SECRET=test .venv/bin/python -m pytest tests/ -v
```

---

## Acceptance Checklist (Phase 1B)

**PR1**
- [ ] `control_plane` DB created via documented one-time command
- [ ] `alembic upgrade head` runs without modifying runtime tables
- [ ] Tables: organizations, users, workspaces, roles, memberships, email_verification_tokens

**PR2**
- [ ] `POST /api/cp/signup` returns JWT
- [ ] `POST /api/cp/login` returns JWT
- [ ] `GET /api/cp/me` returns user with valid JWT
- [ ] `POST /api/cp/workspaces` creates workspace
- [ ] `GET /api/cp/workspaces` lists user's workspaces
- [ ] No changes to governance-engine, LibreChat, nginx

**PR3**
- [ ] `pytest tests/` passes (auth + workspace tests)
- [ ] Tests use SQLite + transactional rollback (no test DB required)
