"""Authentication API — proxies to api.bio-spring.top."""

from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
import httpx

from biogas.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
async def register(data: RegisterRequest):
    try:
        result = await auth_service.register(data.username, data.password)
    except httpx.HTTPStatusError as e:
        detail = e.response.json().get("detail", "注册失败") if e.response.content else "注册失败"
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    return result


@router.post("/login")
async def login(data: LoginRequest):
    try:
        result = await auth_service.login(data.username, data.password)
    except httpx.HTTPStatusError as e:
        detail = e.response.json().get("detail", "登录失败") if e.response.content else "登录失败"
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    return result


@router.get("/me")
async def get_me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="未登录")
    token = authorization.replace("Bearer ", "")
    try:
        result = await auth_service.get_me(token)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="获取用户信息失败")
    return result
