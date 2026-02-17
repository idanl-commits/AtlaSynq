#!/usr/bin/env python3
"""
Google OAuth Refresh Token Generator for AtlaSynq.

Your current GOOGLE_REFRESH_TOKEN is expired. Run this script to get a new one.

Usage:
    python refresh_google_token.py

Prerequisites:
    pip install google-auth-oauthlib

It will:
1. Read GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from .env
2. Open a browser for you to authorize
3. Print the new GOOGLE_REFRESH_TOKEN
4. Optionally update .env automatically
"""

import os
import re
import sys
import json
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import ssl

# ---------- CONFIG ----------
SCOPES = [
    "https://mail.google.com/",                          # Full Gmail (read + send)
    "https://www.googleapis.com/auth/calendar",           # Full Calendar
    "https://www.googleapis.com/auth/drive.readonly",     # Drive read
    "https://www.googleapis.com/auth/documents.readonly", # Docs read
    "https://www.googleapis.com/auth/spreadsheets",       # Sheets
]
REDIRECT_PORT = 8089
REDIRECT_URI = f"http://localhost:{REDIRECT_PORT}"
# ----------------------------


def load_env(path=".env"):
    """Load key=value pairs from .env file."""
    env = {}
    if not os.path.exists(path):
        return env
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def update_env_file(path, key, value):
    """Update a single key in the .env file."""
    lines = []
    found = False
    with open(path) as f:
        for line in f:
            if line.strip().startswith(f"{key}="):
                lines.append(f"{key}={value}\n")
                found = True
            else:
                lines.append(line)
    if not found:
        lines.append(f"{key}={value}\n")
    with open(path, "w") as f:
        f.writelines(lines)


class OAuthHandler(BaseHTTPRequestHandler):
    """Captures the OAuth callback."""
    auth_code = None

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        if "code" in query:
            OAuthHandler.auth_code = query["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h1>Authorization successful!</h1><p>You can close this tab.</p>")
        else:
            self.send_response(400)
            self.end_headers()
            error = query.get("error", ["unknown"])[0]
            self.wfile.write(f"Error: {error}".encode())

    def log_message(self, format, *args):
        pass  # Suppress logs


def main():
    env = load_env(".env")
    client_id = env.get("GOOGLE_CLIENT_ID") or os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = env.get("GOOGLE_CLIENT_SECRET") or os.environ.get("GOOGLE_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env")
        sys.exit(1)

    print("=" * 60)
    print("  AtlaSynq - Google OAuth Refresh Token Generator")
    print("=" * 60)
    print(f"\n  Client ID: {client_id[:20]}...")
    print(f"  Scopes: {len(SCOPES)} (Gmail, Calendar, Drive, Docs, Sheets)")
    print(f"  Redirect: {REDIRECT_URI}")

    # Build authorization URL
    scope_str = "+".join(s.replace("/", "%2F").replace(":", "%3A") for s in SCOPES)
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope_str}"
        f"&access_type=offline"
        f"&prompt=consent"
    )

    print(f"\n  Opening browser for authorization...\n")
    webbrowser.open(auth_url)

    # Start local server to catch callback
    server = HTTPServer(("localhost", REDIRECT_PORT), OAuthHandler)
    server.handle_request()  # Wait for one request

    if not OAuthHandler.auth_code:
        print("ERROR: No authorization code received.")
        sys.exit(1)

    print("  Authorization code received! Exchanging for tokens...")

    # Exchange code for tokens
    import urllib.request
    import urllib.parse

    data = urllib.parse.urlencode({
        "code": OAuthHandler.auth_code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }).encode()

    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req) as resp:
            tokens = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"ERROR: Token exchange failed ({e.code}): {body}")
        sys.exit(1)

    refresh_token = tokens.get("refresh_token")
    access_token = tokens.get("access_token")

    if not refresh_token:
        print("ERROR: No refresh_token in response. Try adding &prompt=consent to force re-consent.")
        print(f"Response: {json.dumps(tokens, indent=2)}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("  SUCCESS! New tokens generated.")
    print("=" * 60)
    print(f"\n  GOOGLE_REFRESH_TOKEN={refresh_token}\n")

    # Ask to auto-update .env
    answer = input("  Update .env and platform/.env automatically? [Y/n]: ").strip().lower()
    if answer in ("", "y", "yes"):
        for path in [".env", "platform/.env"]:
            if os.path.exists(path):
                update_env_file(path, "GOOGLE_REFRESH_TOKEN", refresh_token)
                print(f"  Updated {path}")
        print("\n  Now restart your containers:")
        print("    docker compose down && docker compose up -d --build")
        print("    cd platform && docker compose down && docker compose up -d --build")
    else:
        print("  Paste this into your .env files manually:")
        print(f"    GOOGLE_REFRESH_TOKEN={refresh_token}")

    print()


if __name__ == "__main__":
    main()
