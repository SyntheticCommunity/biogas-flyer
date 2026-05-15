from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./biogas.db"

    # Dashscope (Alibaba Cloud AI)
    dashscope_api_key: str = ""
    dashscope_model: str = "qwen-plus"

    # MinerU (document parsing)
    mineru_model_size: str = "small"

    # WeChat
    wechat_appid: str = ""
    wechat_appsecret: str = ""
    wechat_redirect_url: str = ""

    # Aliyun OSS
    aliyun_oss_access_key: str = ""
    aliyun_oss_secret_key: str = ""
    aliyun_oss_bucket: str = ""
    aliyun_oss_endpoint: str = ""

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # Admin
    admin_wechat_openid: str = ""

    # App
    base_url: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
