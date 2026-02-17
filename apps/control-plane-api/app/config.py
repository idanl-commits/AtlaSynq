"""Control-plane config from env."""
import os
from functools import lru_cache


@lru_cache
def get_config():
    return {
        "cp_database_url": os.getenv(
            "CP_DATABASE_URL",
            "postgresql://atlasynq:atlasynq_postgres_password@localhost:5432/control_plane",
        ),
        "jwt_secret": os.getenv("CP_JWT_SECRET", "dev-jwt-secret-change-in-production"),
        "jwt_access_ttl": int(os.getenv("CP_JWT_ACCESS_TTL", "900")),
        "jwt_algorithm": os.getenv("CP_JWT_ALGORITHM", "HS256"),
    }
