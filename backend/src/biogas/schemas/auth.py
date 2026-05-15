from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserInfo(BaseModel):
    id: str
    name: str | None = None
    avatar_url: str | None = None
    is_admin: bool = False
