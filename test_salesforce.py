#!/usr/bin/env python3
"""
Test Salesforce connection using credentials from .env.
Authenticates via OAuth2 Client Credentials flow (grant_type=client_credentials).
Uses Client ID and Secret to get an access token directly. 'Run As' user is configured in the Connected App.
"""
import os
import sys
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

try:
    import httpx
except ImportError:
    print("Installing httpx...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "httpx", "-q"])
    import httpx

SF_LOGIN_URL = os.environ.get("SALESFORCE_LOGIN_URL", "https://login.salesforce.com")
# For Client Credentials flow, token endpoint must be your org's My Domain (not login.salesforce.com)
# Get it from Setup > My Domain. Example: if domain is "acme", use acme
SF_MY_DOMAIN = os.environ.get("SALESFORCE_MY_DOMAIN", "")
SF_CLIENT_ID = os.environ.get("SALESFORCE_CLIENT_ID", "")
SF_CLIENT_SECRET = os.environ.get("SALESFORCE_CLIENT_SECRET", "")


def main():
    print("=" * 50)
    print("Salesforce Connection Test (Client Credentials Flow)")
    print("=" * 50)

    if not all([SF_CLIENT_ID, SF_CLIENT_SECRET]):
        print("Missing credentials in .env")
        print(f"  CLIENT_ID: {'(set)' if SF_CLIENT_ID else '(missing)'}")
        print(f"  CLIENT_SECRET: {'(set)' if SF_CLIENT_SECRET else '(missing)'}")
        sys.exit(1)

    # Client Credentials requires org's My Domain. Dev Edition uses .develop.my.salesforce.com
    if SF_MY_DOMAIN:
        # Try standard first; Dev Edition often uses .develop. subdomain
        if "dev-ed" in SF_MY_DOMAIN or "develop" in SF_MY_DOMAIN.lower():
            token_url = f"https://{SF_MY_DOMAIN}.develop.my.salesforce.com/services/oauth2/token"
        else:
            token_url = f"https://{SF_MY_DOMAIN}.my.salesforce.com/services/oauth2/token"
    else:
        token_url = f"{SF_LOGIN_URL}/services/oauth2/token"
    print(f"Token URL: {token_url}")
    print()

    # Step 1: OAuth2 Client Credentials token
    print("1. Authenticating (client_credentials)...")
    with httpx.Client(timeout=15.0) as client:
        r = client.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": SF_CLIENT_ID,
                "client_secret": SF_CLIENT_SECRET,
            },
        )

    if r.status_code != 200:
        print(f"   FAILED: HTTP {r.status_code}")
        print("\n--- FULL SALESFORCE ERROR RESPONSE ---")
        print(r.text)
        print("--- END RESPONSE ---")
        try:
            err = r.json()
            desc = err.get("error_description", "")
            print(f"\nParsed - error: {err.get('error', '')}")
            print(f"Parsed - error_description: {desc}")
            if "not supported on this domain" in (desc or ""):
                print("\n>>> Client Credentials requires your org's My Domain. Add to .env:")
                print("    SALESFORCE_MY_DOMAIN=yourdomain")
                print("    (Find it in Setup > My Domain)")
        except Exception:
            pass
        sys.exit(1)

    data = r.json()
    access_token = data.get("access_token", "")
    instance_url = data.get("instance_url", "").rstrip("/")
    if not instance_url:
        # Client Credentials may return instance_url in a different field or require construction
        instance_url = data.get("instance_url", SF_LOGIN_URL.replace("login.", ""))

    print(f"   OK - Instance: {instance_url}")

    # Step 2: Fetch 1 Contact
    print("\n2. Fetching 1 Contact...")
    api_version = "v59.0"
    with httpx.Client(timeout=15.0) as client:
        r2 = client.get(
            f"{instance_url}/services/data/{api_version}/query",
            params={"q": "SELECT Id, Name, Email FROM Contact LIMIT 1"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if r2.status_code != 200:
        print(f"   FAILED: HTTP {r2.status_code}")
        print(f"   {r2.text[:500]}")
        sys.exit(1)

    q = r2.json()
    records = q.get("records", [])
    total = q.get("totalSize", 0)
    print(f"   OK - Found {total} contact(s)")
    if records:
        c = records[0]
        print(f"   Sample: {c.get('Name', 'N/A')} ({c.get('Email', 'N/A')})")
    else:
        print("   (No contacts in org yet - auth still succeeded)")

    print("\n" + "=" * 50)
    print("SUCCESS: Salesforce connection is working.")
    print("=" * 50)


if __name__ == "__main__":
    main()
