#!/usr/bin/env bash
# Run control-plane-api tests. Uses sqlite + transactional rollback.
set -e
cd "$(dirname "$0")/.."

if [ ! -d ".venv" ]; then
  echo "Creating .venv and installing dependencies..."
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

CP_DATABASE_URL="sqlite:///./test_cp.db" CP_JWT_SECRET=test .venv/bin/python -m pytest tests/ -v "$@"
