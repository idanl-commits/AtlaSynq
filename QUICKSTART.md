# AtlaSynq Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Ports 3080, 8000, and 5432 available

### Step 1: Start All Services

```bash
docker-compose up -d
```

This will start:
- ✅ PostgreSQL database (port 5432)
- ✅ Governance Engine API (port 8000)
- ✅ LibreChat UI (port 3080)

### Step 2: Verify Services

**Check Governance Engine:**
```bash
curl http://localhost:8000/health
```

**Check LibreChat:**
Open browser: `http://localhost:3080`

**Check API Documentation:**
Open browser: `http://localhost:8000/docs`

### Step 3: View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f governance-engine
```

## 📋 Project Structure

```
.
├── docs/                          # Landing Page (unchanged)
├── platform/
│   └── governance-engine/         # Python FastAPI Service
│       ├── agents/
│       │   └── sales_agent.py     # Sales Agent MCP Server
│       ├── policies/
│       │   └── policies.yaml      # Governance rules
│       ├── models/                # Data models
│       ├── database/              # DB models & connection
│       └── main.py                # FastAPI app
└── docker-compose.yml             # Service orchestration
```

## 🔧 Configuration

### Edit Policies

Edit `platform/governance-engine/policies/policies.yaml`:

```yaml
policies:
  - name: "Sales Agent - Read Leads"
    user_role: "sales_agent"
    resource: "lead"
    allowed_actions:
      - "read"
      # "delete" is NOT allowed
```

### Environment Variables

Edit `docker-compose.yml` to change:
- Database passwords
- JWT secrets
- API ports

## 🧪 Test the API

**Execute a Sales Agent action:**
```bash
curl -X POST http://localhost:8000/api/v1/agent/sales/execute \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "action": "read",
    "resource": "lead",
    "params": {}
  }'
```

**Check policies:**
```bash
curl http://localhost:8000/api/v1/policies
```

## 🛑 Stop Services

```bash
docker-compose down
```

To also remove volumes:
```bash
docker-compose down -v
```

## 📚 Next Steps

1. **Integrate CRM**: Update `sales_agent.py` to connect to Salesforce/CRM
2. **Add More Agents**: Create HR Agent, Finance Agent, etc.
3. **Configure LibreChat**: Set up MCP server connection in LibreChat settings
4. **Production Setup**: Change all default passwords and secrets

## 🐛 Troubleshooting

**Service won't start:**
```bash
docker-compose logs [service-name]
```

**Database connection issues:**
- Check if PostgreSQL is healthy: `docker-compose ps`
- Verify DATABASE_URL in governance-engine environment

**Port conflicts:**
- Change ports in `docker-compose.yml` if 3080, 8000, or 5432 are in use
