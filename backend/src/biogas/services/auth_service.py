"""Auth service — proxies registration/login to api.bio-spring.top."""

from __future__ import annotations

import httpx

from biogas.config import settings


class AuthService:
    """Calls api.bio-spring.top for user registration, login, and info."""

    async def register(self, username: str, password: str) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{settings.auth_api_url}/register",
                json={"username": username, "password": password},
            )
            resp.raise_for_status()
            return resp.json()

    async def login(self, username: str, password: str) -> dict:
        """Returns the full response body from the auth API (contains access_token)."""
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{settings.auth_api_url}/login",
                json={"username": username, "password": password},
            )
            resp.raise_for_status()
            return resp.json()

    async def get_me(self, token: str) -> dict:
        """Fetch current user info from api.bio-spring.top using the caller's token."""
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.auth_api_url}/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            resp.raise_for_status()
            return resp.json()


auth_service = AuthService()
