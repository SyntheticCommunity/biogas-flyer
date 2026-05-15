"""Auth dependencies — verify tokens via api.bio-spring.top."""

from __future__ import annotations

import httpx
from fastapi import Depends, HTTPException, Header, status

from biogas.services.auth_service import auth_service


async def get_current_user(authorization: str = Header(None)) -> dict | None:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "")
    try:
        result = await auth_service.get_me(token)
        return result.get("data")
    except httpx.HTTPStatusError:
        return None


def require_user(user: dict | None = Depends(get_current_user)) -> dict:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录",
        )
    return user


def require_admin(user: dict = Depends(require_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )
    return user
