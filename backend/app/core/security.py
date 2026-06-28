from passlib.context import CryptContext

from app.core.config import settings

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_ALGORITHM = settings.jwt_algorithm
JWT_SECRET_KEY = settings.jwt_secret_key
