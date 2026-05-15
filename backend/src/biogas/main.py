from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from biogas.api.admin import router as admin_router
from biogas.api.articles import router as articles_router
from biogas.api.auth import router as auth_router
from biogas.api.papers import router as papers_router
from biogas.api.qa import router as qa_router
from biogas.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await init_db()
    yield


app = FastAPI(title="Biogas Slurry Science Platform", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(papers_router)
app.include_router(admin_router)
app.include_router(qa_router)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
