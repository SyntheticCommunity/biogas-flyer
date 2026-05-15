"""Tests for the /api/auth endpoints."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture
async def client():
    """Async test client wired to the FastAPI app (no DB needed for health)."""
    from biogas.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient) -> None:
    """The /api/health endpoint returns {'status': 'ok'}."""
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_qrcode_endpoint_returns_url(client: AsyncClient) -> None:
    """GET /api/auth/wechat/qrcode returns a dict with a 'url' key."""
    resp = await client.get("/api/auth/wechat/qrcode")
    assert resp.status_code == 200
    body = resp.json()
    assert "url" in body
    assert "open.weixin.qq.com" in body["url"]
    assert "appid=" in body["url"]


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient) -> None:
    """GET /api/auth/me returns 401 when no token is provided."""
    resp = await client.get("/api/auth/me")
    assert resp.status_code == 401
