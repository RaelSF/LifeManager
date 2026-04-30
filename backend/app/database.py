from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, DeclarativeBase

from app.config import settings

# Engine assíncrono usando aiosqlite
engine = create_engine(
    settings.database_url,
    echo=settings.app_env == "development",
    connect_args={"check_same_thread": False},
)

# Factory de sessões assíncronas
SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False,
)


# Base declarativa para todos os modelos
class Base(DeclarativeBase):
    pass


# Dependency Injection para FastAPI
def get_db() -> Session:
    with SessionLocal() as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
