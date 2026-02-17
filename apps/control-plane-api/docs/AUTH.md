# Control-Plane API — Authentication

**Method: Bearer token**

- Signup and login return a JWT in the response body (`access_token`).
- Protected endpoints require the header: `Authorization: Bearer <access_token>`.
- TTL: 900 seconds (15 min) by default, configurable via `CP_JWT_ACCESS_TTL`.
