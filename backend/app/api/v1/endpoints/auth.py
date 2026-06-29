from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.db.session import get_db
from app.models.auth import User
from app.schemas.auth import (
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    TokenResponse,
    UserRead,
)
from app.services.auth_service import (
    authenticate_user,
    get_organization_by_name,
    get_user_by_email,
    get_user_by_id,
    register_user,
    serialize_user,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a user and organization",
)
def register(
    payload: RegisterRequest,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    if get_user_by_email(db, payload.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    if get_organization_by_name(db, payload.organization_name) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An organization with this name already exists",
        )

    user = register_user(db, payload)
    return _issue_tokens(user, response)


@router.post("/login", response_model=TokenResponse, summary="Log in")
def login(
    payload: LoginRequest,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _issue_tokens(user, response)


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
def refresh_token(
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    refresh_token_value = request.cookies.get(settings.refresh_token_cookie_name)
    if refresh_token_value is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token",
        )

    try:
        payload = decode_token(refresh_token_value, TokenType.refresh)
        user_id = UUID(str(payload.get("sub")))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from None

    user = get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not active",
        )

    return _issue_tokens(user, response)


@router.get("/me", response_model=UserRead, summary="Get current user")
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> UserRead:
    return serialize_user(current_user)


@router.post("/logout", response_model=MessageResponse, summary="Log out")
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(
        key=settings.refresh_token_cookie_name,
        httponly=True,
        secure=settings.refresh_token_cookie_secure,
        samesite="lax",
    )
    return MessageResponse(detail="Logged out")


def _issue_tokens(user: User, response: Response) -> TokenResponse:
    access_token = create_access_token(user.id)
    refresh_token_value = create_refresh_token(user.id)
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=refresh_token_value,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.refresh_token_cookie_secure,
        samesite="lax",
    )
    return TokenResponse(access_token=access_token, user=serialize_user(user))
