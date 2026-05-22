from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .models import User

_PBKDF2_ITERATIONS = 210_000

def _b64e(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode("utf-8").rstrip("=")

def _b64d(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)

def hash_password(password: str) -> str:
    if not isinstance(password, str) or password == "":
        raise ValueError("password is required")
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${_b64e(salt)}${_b64e(dk)}"

def verify_password(password: str, password_hash: str) -> bool:
    try:
        scheme, it_s, salt_s, dk_s = password_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(it_s)
        salt = _b64d(salt_s)
        dk_expected = _b64d(dk_s)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(dk, dk_expected)
    except Exception:
        return False

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.JWT_EXPIRES_MINUTES)
    payload = {"sub": subject, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def _decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = _decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("missing sub")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user

def require_auth(user: User = Depends(get_current_user)) -> str:
    return user.id

def create_verification_token() -> str:
    return secrets.token_urlsafe(32)

def verify_verification_token(token: str, db: Session) -> Optional[User]:
    if not token:
        return None
    user = db.query(User).filter(User.verification_token == token).first()
    return user
