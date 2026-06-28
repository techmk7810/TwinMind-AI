from fastapi import APIRouter
from sqlalchemy import text

from app.db.session import engine

router = APIRouter()


@router.get("", summary="Service health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/database", summary="Database connectivity")
def database_health_check() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"status": "ok"}
