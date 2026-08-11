# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

AtlaSynq is an Enterprise AI Governance Platform ("Governed AI agents for your enterprise stack"). This **public repository** contains only the static marketing/landing page (HTML/CSS/JS) in `docs/`. All backend services (Governance Engine, LibreChat, databases, etc.) were removed to create a website-only repo; see `REMOVE_PRIVATE_FROM_PUBLIC.md` for details.

The site includes: homepage with interactive hero demo widget, features, pricing, integrations catalog, blog/insights hub, ROI page, signup/login pages, and standard legal/about pages.

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

Note: there is one pre-existing htmlhint warning (duplicate `cookieManageLink` ID in pricing). This is cosmetic and does not affect rendering.

### Key notes

- There is no `package.json`, no build tooling, and no automated test suite in this repo.
- The `docs/CNAME` file points to `atlasynq.com` (GitHub Pages custom domain).
- Pages use shared external CSS files (`css/clay-marketing.css`, `css/pages.css`, `css/growth.css`, `css/product-mock.css`, `css/blog.css`) and JS files (`js/hero-widget/`, `js/site-demos.js`, `js/growth-ui.js`).
- The hero widget (`docs/js/hero-widget/hero-widget.js`) is a large self-contained vanilla JS module (~51k lines) — no external dependencies or bundler needed.
- The `README.md` references the full private architecture (docker-compose, FastAPI, etc.) that is **not** present in this public repo.
