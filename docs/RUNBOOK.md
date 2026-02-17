# AtlaSynq Runbook

## Rollback Procedure

### Quick Rollback (Docker Compose)

1. **Identify last good version**
   ```bash
   git tag -l 'v*'   # List tags
   git log --oneline -10   # Or use recent commit SHA
   ```

2. **Stop current stack**
   ```bash
   docker compose down
   # Or with staging overlay:
   docker compose -f docker-compose.yml -f infra/docker/compose.staging.yml down
   ```

3. **Checkout previous version**
   ```bash
   git checkout v1.0-stable   # Or: git checkout <last-good-SHA>
   ```

4. **Rebuild and start**
   ```bash
   docker compose build --no-cache
   docker compose up -d
   # Verify: curl http://localhost:3080/health  # or your staging URL
   ```

5. **Verify health**
   ```bash
   curl http://localhost:8000/health   # governance-engine
   curl http://localhost:3080/         # nginx → librechat
   ```

### Rollback with Image Tags (if using registry)

If deploying from GHCR with pinned tags:

```bash
# Edit compose to use previous image tag, e.g.:
# image: ghcr.io/owner/atlasynq-governance-engine:abc1234
docker compose pull
docker compose up -d
```

### Rollback Checklist

- [ ] Note current version/tag before rollback
- [ ] Stop services cleanly
- [ ] Checkout or use previous image
- [ ] Rebuild if using local build
- [ ] Start services
- [ ] Verify /health endpoints
- [ ] Smoke test: chat, OAuth, Slack
- [ ] Document incident and root cause

---

## Health Checks

| Service            | Endpoint                      | Expected                        |
|--------------------|-------------------------------|---------------------------------|
| Governance Engine  | `GET /health`                 | `{"status":"healthy",...}`      |
| Root               | `GET /`                       | `{"status":"healthy"}`          |
| LibreChat (via nginx) | `GET /`                    | HTML or 200                    |

---

## Scaling and Incident Response

### High Load

- Scale workers: `docker compose up -d --scale worker=2`
- Redis: ensure `maxmemory` and eviction policy are adequate
- DB: monitor connection pool (`DB_POOL_SIZE`)

### Secret Rotation

1. Generate new keys (JWT, ENCRYPTION_KEY)
2. Update `.env` or secrets store
3. Restart services: `docker compose restart`
4. Users may need to re-connect OAuth (if ENCRYPTION_KEY changed)

### Database Migration

```bash
cd platform/governance-engine
alembic upgrade head
```

---

## Staging vs Production

- **Staging**: `docker compose -f docker-compose.yml -f infra/docker/compose.staging.yml up -d`
- **Production**: Use same stack with production `.env` or `--profile production` for SSL (nginx-ssl, certbot)
