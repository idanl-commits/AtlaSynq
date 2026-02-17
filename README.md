# AtlaSynq Project

Enterprise AI Governance Platform with Landing Page + Web App Architecture.

## Project Structure

```
.
├── docs/                    # Marketing/Landing Page (Static HTML/CSS/JS)
├── platform/                # Web App Platform
│   └── governance-engine/  # Python FastAPI service (Agent Brain)
├── docker-compose.yml       # Orchestration for all services
└── README.md
```

## Architecture

### Landing Page (`docs/`)
- Static HTML/CSS/JavaScript marketing site
- Entry point for the domain
- No changes needed - serves as the public-facing website

### Web App Platform (`platform/`)

#### Services:
1. **LibreChat** - Frontend UI for AI agents
2. **Governance Engine** - Python FastAPI service that:
   - Enforces policies (defined in `policies.yaml`)
   - Acts as MCP Server for LibreChat
   - Manages Sales Agent and other agents
3. **PostgreSQL** - Database for logs and permissions

## Quick Start

1. **Start all services:**
```bash
docker-compose up -d
```

2. **Access services:**
- Landing Page: `http://localhost` (served from `docs/`)
- LibreChat UI: `http://localhost:3080`
- Governance Engine API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

3. **Check health:**
```bash
curl http://localhost:8000/health
```

## Configuration

### Environment Variables

Edit `docker-compose.yml` to configure:
- Database credentials
- JWT secrets (CHANGE IN PRODUCTION)
- CORS settings
- MCP server URLs

### Policies

Edit `platform/governance-engine/policies/policies.yaml` to define:
- User roles and permissions
- Allowed actions per resource
- Access control rules

Example policy:
```yaml
- name: "Sales Agent - Read Leads"
  user_role: "sales_agent"
  resource: "lead"
  allowed_actions:
    - "read"
    # Note: "delete" is NOT allowed
```

## Development

### Governance Engine
```bash
cd platform/governance-engine
pip install -r requirements.txt
uvicorn main:app --reload
```

### Adding New Agents

1. Create agent class in `platform/governance-engine/agents/`
2. Implement MCP server methods
3. Add policies in `policies.yaml`
4. Register in `main.py`

## Production Deployment

⚠️ **IMPORTANT**: Before deploying to production:

1. Change all default passwords in `docker-compose.yml`
2. Set secure JWT secrets
3. Configure proper CORS origins
4. Use environment variables for sensitive data
5. Enable SSL/TLS
6. Set up proper database backups

## License

Proprietary - AtlaSynq Inc.
