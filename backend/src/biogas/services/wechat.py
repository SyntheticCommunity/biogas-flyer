"""WeChat Open Platform OAuth2.0 service."""

from __future__ import annotations

import httpx

from biogas.config import settings

TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token"
USER_INFO_URL = "https://api.weixin.qq.com/sns/userinfo"
QRCONNECT_URL = "https://open.weixin.qq.com/connect/qrconnect"


class WeChatService:
    """Handles WeChat OAuth2.0 web login flow."""

    async def get_qrconnect_url(self, state: str = "") -> str:
        """Build the WeChat QR code authorization URL."""
        from urllib.parse import urlencode

        params = {
            "appid": settings.wechat_appid,
            "redirect_uri": settings.wechat_redirect_url,
            "response_type": "code",
            "scope": "snsapi_login",
            "state": state,
        }
        return f"{QRCONNECT_URL}?{urlencode(params)}#wechat_redirect"

    async def get_access_token(self, code: str) -> dict:
        """Exchange an authorization code for an access_token and openid.

        Returns a dict containing at least ``access_token``, ``openid``,
        ``expires_in``, and ``refresh_token``.
        Raises ValueError if the WeChat API returns an error.
        """
        params = {
            "appid": settings.wechat_appid,
            "secret": settings.wechat_appsecret,
            "code": code,
            "grant_type": "authorization_code",
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(TOKEN_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        if "errcode" in data and data["errcode"] != 0:
            raise ValueError(
                f"WeChat token error {data['errcode']}: {data.get('errmsg', 'unknown')}"
            )
        return data

    async def get_user_info(self, access_token: str, openid: str) -> dict:
        """Fetch the user's WeChat profile.

        Returns a dict with fields like ``openid``, ``nickname``, ``headimgurl``, etc.
        """
        params = {
            "access_token": access_token,
            "openid": openid,
            "lang": "zh_CN",
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(USER_INFO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        if "errcode" in data and data["errcode"] != 0:
            raise ValueError(
                f"WeChat user info error {data['errcode']}: {data.get('errmsg', 'unknown')}"
            )
        return data


wechat_service = WeChatService()
