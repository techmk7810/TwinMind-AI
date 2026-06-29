from datetime import UTC, datetime, timedelta
from enum import StrEnum
from typing import Any
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

password_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

JWT_ALGORITHM = settings.jwt_algorithm
JWT_SECRET_KEY = settings.jwt_secret_key


class TokenType(StrEnum):
    access = "access"
    refresh = "refresh"


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def create_access_token(user_id: UUID) -> str:
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    return _create_token(
        user_id=user_id, token_type=TokenType.access, expires_delta=expires_delta
    )


def create_refresh_token(user_id: UUID) -> str:
    expires_delta = timedelta(days=settings.refresh_token_expire_days)
    return _create_token(
        user_id=user_id, token_type=TokenType.refresh, expires_delta=expires_delta
    )


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc

    if payload.get("type") != expected_type:
        raise ValueError("Invalid token type")

    return payload


def _create_token(
    user_id: UUID, token_type: TokenType, expires_delta: timedelta
) -> str:
    expires_at = datetime.now(UTC) + expires_delta
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "exp": expires_at,
        "iat": datetime.now(UTC),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
