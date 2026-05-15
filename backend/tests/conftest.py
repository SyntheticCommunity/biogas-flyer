"""Shared fixtures for backend integration tests."""

from __future__ import annotations

from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from biogas.database import Base, get_db


@pytest.fixture()
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async test client wired to the FastAPI app with an in-memory SQLite DB.

    Each test gets a fresh database with all tables created, so tests are
    fully isolated.  The ``get_db`` dependency is overridden to point at the
    ephemeral engine.
    """
    from biogas.main import app

    # In-memory SQLite — fast and isolated per test
    test_engine = create_async_engine("sqlite+aiosqlite://", echo=False)
    TestSessionLocal = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with TestSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Clean up
    app.dependency_overrides.clear()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()
