# AtlaSynq Security Guide

## Secret Management

### Environment Variables
All secrets are stored in `platform/.env` and injected via Docker Compose. **NEVER commit this file to git.**

| Secret | Purpose | Rotation |
|--------|---------|----------|
| `JWT_SECRET` | LibreChat session tokens | Rotate yearly; invalidates all sessions |
| `JWT_REFRESH_SECRET` | LibreChat refresh tokens | Rotate yearly; invalidates all refresh tokens |
| `ENCRYPTION_KEY` | Fernet encryption for stored OAuth tokens | **DO NOT rotate** unless you re-encrypt all tokens |
| `ATLASYNQ_API_KEY` | Internal API authentication | Rotate quarterly |
| `POSTGRES_PASSWORD` | Database access | Rotate quarterly |
| `MONGO_PASSWORD` | MongoDB access | Rotate quarterly |
| `ANTHROPIC_API_KEY` | Claude LLM API | Per Anthropic policy |
| `SLACK_*` tokens | Slack bot access | Per Slack policy |
| `SALESFORCE_*` creds | Salesforce CRM access | Per Salesforce policy |
| `GOOGLE_*` creds | Google Workspace OAuth | Per Google policy |

### Production Secret Management
For production, migrate from `.env` to:
- **Docker Secrets** (built-in, file-based)
- **HashiCorp Vault** (enterprise-grade)
- **AWS Secrets Manager** / **GCP Secret Manager** (cloud-native)

## Container Hardening

All containers run with:
- **Non-root users**: `atlasynq` (governance-engine), `mcpuser` (MCP servers)
- **Multi-stage Docker builds**: No build tools (gcc) in production images
- **Health checks**: Every container has a health check with retry logic
- **`--no-install-recommends`**: Minimal apt packages
- **Read-only volumes**: Config files mounted as `:ro`

## Network Security

- **Internal network**: All services communicate on `atlasynq-network` (Docker bridge)
- **Rate limiting**: Nginx enforces per-IP rate limits (30 req/s API, 5 req/s auth)
- **API key auth**: Protected endpoints require `X-API-Key` header
- **CORS**: Restricted to configured origins only
- **HTTPS**: Production uses Let's Encrypt with auto-renewal (see `docker compose --profile production`)

## SSL/TLS (Production)

1. Set `DOMAIN=yourdomain.com` in `.env`
2. Obtain initial certificate:
   ```bash
   docker compose --profile production run --rm certbot \
     certbot certonly --webroot -w /var/www/certbot \
     -d yourdomain.com --agree-tos --email admin@yourdomain.com
   ```
3. Start with HTTPS:
   ```bash
   docker compose --profile production up -d
   ```
4. Certificates auto-renew every 12 hours via the certbot container.

## Audit Trail

All security events are logged to:
- **Console**: Structured JSON logs (when `LOG_FORMAT=json`)
- **Database**: `security_audit_logs` table in PostgreSQL
- **Grafana/Loki**: All container logs aggregated and searchable

Events tracked: API auth failures, session expirations, tool calls, write operations.

## Compliance Checklist

- [x] Secrets not in source code
- [x] Non-root containers
- [x] HTTPS/TLS support
- [x] Rate limiting
- [x] API key authentication
- [x] CORS restrictions
- [x] Session timeout enforcement
- [x] Audit logging
- [x] Database connection pooling with health probes
- [x] Redis data persistence (AOF)
- [x] Health check endpoints
- [x] Prometheus metrics for monitoring
- [x] Centralized logging (Loki + Grafana)
