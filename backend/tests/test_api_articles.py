"""Integration tests for the articles and Q&A API endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


async def test_health(client: AsyncClient) -> None:
    """GET /api/health returns 200 with {"status": "ok"}."""
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


async def test_list_articles_empty(client: AsyncClient) -> None:
    """GET /api/articles returns 200 with an empty list when no articles exist."""
    resp = await client.get("/api/articles")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_article_not_found(client: AsyncClient) -> None:
    """GET /api/articles/<nonexistent-slug> returns 404."""
    resp = await client.get("/api/articles/nonexistent")
    assert resp.status_code == 404


async def test_qa_requires_article(client: AsyncClient) -> None:
    """POST /api/qa with a nonexistent article_id returns 404."""
    resp = await client.post(
        "/api/qa",
        json={
            "article_id": "nonexistent-id",
            "session_id": "test-session",
            "question": "What is biogas slurry?",
        },
    )
    assert resp.status_code == 404
