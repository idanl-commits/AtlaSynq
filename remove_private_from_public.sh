#!/usr/bin/env bash
# Remove private/sensitive content from public repo (AtlaSynq)
# Run from repo root: ./remove_private_from_public.sh
# Then: git status (review), git commit, git push

set -e
cd "$(dirname "$0")"

echo "=== Removing private content from public repo ==="

# Remove dirs (git rm -r)
for dir in infra apps platform packages .github; do
  if [ -d "$dir" ]; then
    echo "Removing $dir/"
    git rm -rf "$dir" 2>/dev/null || true
  fi
done

# Remove root files
for f in docker-compose.yml refresh_google_token.py test_salesforce.py QUICKSTART.md; do
  if [ -f "$f" ]; then
    echo "Removing $f"
    git rm -f "$f" 2>/dev/null || true
  fi
done

# Remove internal docs (keep website pages)
for f in docs/PHASE1A_PR.md docs/PHASE1B_PR.md docs/RUNBOOK.md docs/control-plane-db-init.md; do
  if [ -f "$f" ]; then
    echo "Removing $f"
    git rm -f "$f" 2>/dev/null || true
  fi
done

# Remove .env if ever committed (secrets)
for f in .env platform/.env; do
  if git ls-files --error-unmatch "$f" 2>/dev/null; then
    echo "Removing $f (secrets!)"
    git rm -f "$f"
  fi
done

echo ""
echo "=== Done. Review with: git status"
echo "=== Then: git add -A && git commit -m 'chore: remove private/backend content — website only' && git push"
