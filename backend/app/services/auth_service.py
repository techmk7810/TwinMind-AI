from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.security import hash_password, verify_password
from app.models.auth import Organization, OrganizationRole, User, UserOrganization
from app.schemas.auth import OrganizationRead, RegisterRequest, UserRead


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = (
        select(User)
        .options(
            selectinload(User.organizations).selectinload(UserOrganization.organization)
        )
        .where(User.email == email.lower())
    )
    return db.scalars(statement).first()


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    statement = (
        select(User)
        .options(
            selectinload(User.organizations).selectinload(UserOrganization.organization)
        )
        .where(User.id == user_id)
    )
    return db.scalars(statement).first()


def get_organization_by_name(db: Session, name: str) -> Organization | None:
    statement = select(Organization).where(Organization.name == name.strip())
    return db.scalars(statement).first()


def register_user(db: Session, payload: RegisterRequest) -> User:
    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
    )
    organization = Organization(name=payload.organization_name.strip())
    membership = UserOrganization(
        user=user,
        organization=organization,
        role=OrganizationRole.owner,
    )
    db.add_all([user, organization, membership])
    db.commit()
    db.refresh(user)
    return get_user_by_id(db, user.id) or user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None or not user.is_active:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def user_has_role(user: User, allowed_roles: set[OrganizationRole]) -> bool:
    return any(membership.role in allowed_roles for membership in user.organizations)


def serialize_user(user: User) -> UserRead:
    organizations = [
        OrganizationRead(
            id=membership.organization.id,
            name=membership.organization.name,
            role=membership.role,
        )
        for membership in user.organizations
    ]
    return UserRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        organizations=organizations,
    )
