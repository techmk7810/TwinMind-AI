from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.auth import OrganizationRole


class OrganizationRead(BaseModel):
    id: UUID
    name: str
    role: OrganizationRole


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    is_active: bool
    organizations: list[OrganizationRead] = []


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    organization_name: str = Field(min_length=2, max_length=160)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class MessageResponse(BaseModel):
    detail: str
