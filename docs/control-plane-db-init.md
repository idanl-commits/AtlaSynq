# Control-Plane Database — One-Time Init

The control-plane uses a **separate database** (`control_plane`) in the **existing Postgres** instance. The runtime DB (`atlasynq_governance`) is untouched.

## 1. Create the `control_plane` database

Run once against the running Postgres container:

```bash
# With docker compose running
docker exec -it atlasynq-db psql -U atlasynq -d postgres -c "CREATE DATABASE control_plane;"
```

Or connect manually:

```bash
docker exec -it atlasynq-db psql -U atlasynq -d postgres
```

Then:

```sql
CREATE DATABASE control_plane;
\q
```

## 2. Run migrations

```bash
cd apps/control-plane-api
export CP_DATABASE_URL="postgresql://atlasynq:YOUR_PASSWORD@localhost:5432/control_plane"
# Or from Docker network: postgresql://atlasynq:${POSTGRES_PASSWORD}@db:5432/control_plane
alembic upgrade head
```

## 3. Verify

```bash
docker exec -it atlasynq-db psql -U atlasynq -d control_plane -c "\dt"
```

Expected tables: organizations, users, workspaces, roles, memberships, email_verification_tokens.

## Rollback

To drop the control_plane database (destructive):

```sql
-- Connect to postgres
\c postgres
DROP DATABASE control_plane;
```

Alembic downgrade (drops tables, keeps DB):

```bash
alembic downgrade base
```
