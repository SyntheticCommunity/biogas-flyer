"""Authentication API — WeChat OAuth login + current-user endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.api.deps import create_access_token, get_current_user, require_user
from biogas.config import settings
from biogas.database import get_db
from biogas.models.user import User
from biogas.schemas.auth import TokenResponse, UserInfo
from biogas.services.wechat import wechat_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/wechat/qrcode")
async def wechat_qrcode() -> dict[str, str]:
    """Return the WeChat QR code login URL."""
    url = await wechat_service.get_qrconnect_url()
    return {"url": url}


@router.get("/wechat/callback")
async def wechat_callback(code: str, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Handle WeChat OAuth callback.

    Exchanges the authorization code for an openid, finds or creates the
    corresponding User, and returns a JWT access token.
    """
    token_data = await wechat_service.get_access_token(code)
    access_token = token_data["access_token"]
    openid = token_data["openid"]

    user_info = await wechat_service.get_user_info(access_token, openid)

    # Find or create user
    result = await db.execute(select(User).where(User.wechat_openid == openid))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            wechat_openid=openid,
            name=user_info.get("nickname"),
            avatar_url=user_info.get("headimgurl"),
            is_admin=(openid == settings.admin_wechat_openid),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update profile info on each login
        user.name = user_info.get("nickname") or user.name
        user.avatar_url = user_info.get("headimgurl") or user.avatar_url
        await db.commit()

    jwt_token = create_access_token(user.wechat_openid)
    return TokenResponse(access_token=jwt_token)


@router.get("/me")
async def get_me(user: User = Depends(require_user)) -> UserInfo:
    """Return the current authenticated user's profile."""
    return UserInfo(
        id=user.id,
        name=user.name,
        avatar_url=user.avatar_url,
        is_admin=user.is_admin,
    )
