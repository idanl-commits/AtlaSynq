"""Password hashing (argon2) and JWT."""
import os
from datetime import datetime, timezone, timedelta
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from app.config import get_config

ph = PasswordHasher()
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        ph.verify(hashed, plain)
        return True
    except VerifyMismatchError:
        return False


def create_access_token(user_id: str, email: str) -> str:
    cfg = get_config()
    expire = datetime.now(timezone.utc) + timedelta(seconds=cfg["jwt_access_ttl"])
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(
        payload, cfg["jwt_secret"], algorithm=cfg["jwt_algorithm"]
    )


def decode_token(token: str) -> dict | None:
    try:
        cfg = get_config()
        return jwt.decode(
            token, cfg["jwt_secret"], algorithms=[cfg["jwt_algorithm"]]
        )
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    payload = decode_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
