# Remove Private Content from Public Repo

## Audit: What MUST be removed (sensitive)

| Path | Risk |
|------|------|
| `infra/` | `staging.env.example` — env var names, structure; `compose.staging.yml` — deployment config |
| `apps/` | Control-plane auth, DB, migrations, backend code |
| `platform/` | Governance-engine, MCP servers, nginx, LibreChat — all backend |
| `packages/` | Shared types, possibly API schemas |
| `docker-compose.yml` | Full stack, service layout, env var names |
| `refresh_google_token.py` | OAuth flow, loads .env, credential handling |
| `test_salesforce.py` | Loads .env, Salesforce auth flow |
| `.github/workflows/` | CI/deploy structure |
| `QUICKSTART.md` | Internal setup instructions |
| `docs/PHASE1A_PR.md` | Internal dev docs |
| `docs/PHASE1B_PR.md` | Internal dev docs |
| `docs/RUNBOOK.md` | Ops runbook |
| `docs/control-plane-db-init.md` | DB setup, container names |

## What STAYS (website only)

| Path | Purpose |
|------|---------|
| `docs/index.html` | Homepage |
| `docs/login/` | Login page |
| `docs/signup/` | Signup page |
| `docs/terms/` | Terms |
| `docs/privacy/` | Privacy |
| `docs/security/` | Security policy (vulnerability reporting) |
| `docs/about/` | About |
| `docs/careers/` | Careers |
| `docs/features/` | Features |
| `docs/integrations/` | Integrations |
| `docs/pricing/` | Pricing |
| `docs/images/` | Images |
| `docs/CNAME` | GitHub Pages |
| `docs/404.html` | 404 page |
| `docs/sitemap.xml` | Sitemap |
| `docs/robots.txt` | Robots |
| `docs/favicon.svg` | Favicon |
| `README.md` | Can keep a simple website README |
| `SECURITY.md` | Vulnerability reporting (optional) |
