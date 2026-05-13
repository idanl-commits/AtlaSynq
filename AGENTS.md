# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

AtlaSynq is an Enterprise AI Governance Platform. This **public repository** contains only the static marketing/landing page (HTML/CSS/JS) in `docs/`. All backend services (Governance Engine, LibreChat, databases, etc.) were removed to create a website-only repo; see `REMOVE_PRIVATE_FROM_PUBLIC.md` for details.

### Running the site locally

Serve the static site from the `docs/` directory on any port:

```bash
python3 -m http.server 8080 --directory docs
```

Then open `http://localhost:8080` in a browser. No build step or dependency installation is required.

### Linting

Run HTML lint with:

```bash
npx htmlhint docs/**/*.html
```

Note: the existing codebase has a few pre-existing htmlhint warnings (duplicate IDs, unclosed SVG tags). These are cosmetic and do not affect rendering.

### Key notes

- There is no `package.json`, no build tooling, and no automated test suite in this repo.
- The `docs/CNAME` file points to `atlasynq.com` (GitHub Pages custom domain).
- All pages are self-contained HTML files with inline CSS/JS — no bundler or transpiler.
- The `README.md` references the full private architecture (docker-compose, FastAPI, etc.) that is **not** present in this public repo.
