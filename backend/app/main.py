from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import finance_router, kanban_router, note_router, shopping_router, study_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cria as tabelas no banco de dados na inicialização da aplicação."""
    with engine.begin() as conn:
        Base.metadata.create_all(conn)
    yield


app = FastAPI(
    title="LifeManager API",
    description="API do Gerenciador de Vida Pessoal — Notas, Kanban, Financeiro e Compras.",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS: permite chamadas do frontend Vite em desenvolvimento ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Health check ---
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "LifeManager API", "version": "1.0.0"}


# --- Rotas da Aplicação ---
app.include_router(note_router.router, prefix="/api/v1")
app.include_router(kanban_router.router, prefix="/api/v1")
app.include_router(finance_router.router, prefix="/api/v1")
app.include_router(shopping_router.router, prefix="/api/v1")
app.include_router(study_router.router, prefix="/api/v1")
