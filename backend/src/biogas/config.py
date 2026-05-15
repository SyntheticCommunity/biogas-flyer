from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./data/biogas.db"

    # Dashscope (Alibaba Cloud AI)
    dashscope_api_key: str = ""
    dashscope_model: str = "qwen3.6-plus"

    # MinerU (document parsing)
    mineru_model_size: str = "small"

    # Auth API (api.bio-spring.top)
    auth_api_url: str = "https://api.bio-spring.top/api/v1/auth"

    # Aliyun OSS
    aliyun_oss_access_key: str = ""
    aliyun_oss_secret_key: str = ""
    aliyun_oss_bucket: str = "biogas-papers"
    aliyun_oss_endpoint: str = "oss-cn-qingdao.aliyuncs.com"

    # App
    base_url: str = "https://biogas.bio-spring.top"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
