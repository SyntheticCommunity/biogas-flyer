# 沼液还田科普平台 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack science communication platform for biogas slurry research, featuring AI-powered paper interpretation, WeChat login, article-level Q&A, and an admin CMS.

**Architecture:** FastAPI backend with SQLite + arq task queue, Next.js 15 frontend with Tailwind CSS. MinerU (local) for PDF parsing, Dashscope Qwen for AI inference, Alibaba Cloud OSS for file storage. Deployed on a 2GB Alibaba Cloud server with Nginx reverse proxy.

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy (async), Alembic, SQLite, arq, Next.js 15, React 19, Tailwind CSS, Tanstack Query, Zustand, MinerU, Dashscope Qwen API, Alibaba Cloud OSS

**Design Spec:** `docs/superpowers/specs/2026-05-15-biogas-science-platform-design.md`

---

## File Structure

```
biogas-flyer/
├── backend/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial.py
│   ├── src/
│   │   └── biogas/
│   │       ├── __init__.py
│   │       ├── main.py
│   │       ├── config.py
│   │       ├── database.py
│   │       ├── models/
│   │       │   ├── __init__.py
│   │       │   ├── user.py
│   │       │   ├── article.py
│   │       │   ├── paper.py
│   │       │   └── qa.py
│   │       ├── schemas/
│   │       │   ├── __init__.py
│   │       │   ├── auth.py
│   │       │   ├── article.py
│   │       │   ├── paper.py
│   │       │   └── qa.py
│   │       ├── api/
│   │       │   ├── __init__.py
│   │       │   ├── deps.py
│   │       │   ├── auth.py
│   │       │   ├── articles.py
│   │       │   ├── papers.py
│   │       │   ├── qa.py
│   │       │   └── admin.py
│   │       ├── services/
│   │       │   ├── __init__.py
│   │       │   ├── oss.py
│   │       │   ├── wechat.py
│   │       │   ├── pdf_parser.py
│   │       │   ├── ai_pipeline.py
│   │       │   └── qa_engine.py
│   │       ├── prompts/
│   │       │   └── paper_interpretation.txt
│   │       └── tasks/
│   │           ├── __init__.py
│   │           └── process_paper.py
│   └── tests/
│       ├── conftest.py
│       ├── test_api_auth.py
│       ├── test_api_articles.py
│       └── test_services.py
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── posts/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── admin/
│   │   │   │   └── page.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── UnderstandingCard.tsx
│   │   │   ├── ShareCardButton.tsx
│   │   │   ├── QAPanel.tsx
│   │   │   ├── LoginDialog.tsx
│   │   │   └── PaperUpload.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   └── stores/
│   │       └── auth.ts
│   └── .env.local
├── scripts/
│   └── deploy.sh
├── .env.example
├── .gitignore
└── README.md
```

---

## Task 1: Backend Project Scaffolding

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/src/biogas/__init__.py`
- Create: `backend/src/biogas/config.py`
- Create: `backend/src/biogas/database.py`
- Create: `backend/src/biogas/main.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/versions/001_initial.py`
- Create: `backend/src/biogas/models/__init__.py`
- Create: `backend/src/biogas/models/user.py`
- Create: `backend/src/biogas/models/article.py`
- Create: `backend/src/biogas/models/paper.py`
- Create: `backend/src/biogas/models/qa.py`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Create backend pyproject.toml**

```toml
[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]

[project]
name = "biogas"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "sqlalchemy[asyncio]>=2.0.30",
    "aiosqlite>=0.20.0",
    "alembic>=1.13.0",
    "pydantic>=2.7.0",
    "pydantic-settings>=2.3.0",
    "python-jose[cryptography]>=3.3.0",
    "httpx>=0.27.0",
    "oss2>=2.18.0",
    "openai>=1.30.0",
    "arq>=0.26.0",
    "python-multipart>=0.0.9",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.23.0",
    "httpx>=0.27.0",
    "ruff>=0.4.0",
]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] **Step 2: Create config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./data/biogas.db"

    # AI
    dashscope_api_key: str = ""
    dashscope_model: str = "qwen-plus"

    # MinerU
    mineru_model_size: str = "small"

    # WeChat OAuth
    wechat_appid: str = ""
    wechat_appsecret: str = ""
    wechat_redirect_url: str = "https://biogas.bio-spring.top/api/auth/wechat/callback"

    # OSS
    aliyun_oss_access_key: str = ""
    aliyun_oss_secret_key: str = ""
    aliyun_oss_bucket: str = "biogas-papers"
    aliyun_oss_endpoint: str = "oss-cn-qingdao.aliyuncs.com"

    # Auth
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7
    admin_wechat_openid: str = ""

    # App
    base_url: str = "https://biogas.bio-spring.top"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
```

- [ ] **Step 3: Create database.py**

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from biogas.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

- [ ] **Step 4: Create models**

`backend/src/biogas/models/__init__.py`:
```python
from biogas.models.user import User
from biogas.models.article import Article
from biogas.models.paper import Paper
from biogas.models.qa import QAMessage

__all__ = ["User", "Article", "Paper", "QAMessage"]
```

`backend/src/biogas/models/user.py`:
```python
import uuid
from datetime import datetime

from sqlalchemy import Boolean, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from biogas.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wechat_openid: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

`backend/src/biogas/models/article.py`:
```python
import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from biogas.database import Base


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200))
    subtitle: Mapped[str | None] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    category: Mapped[str | None] = mapped_column(String(50))
    tags: Mapped[list | None] = mapped_column(JSON)
    slurry_type: Mapped[str | None] = mapped_column(String(100))
    crop: Mapped[str | None] = mapped_column(String(100))
    soil_type: Mapped[str | None] = mapped_column(String(100))
    dosage: Mapped[str | None] = mapped_column(String(200))
    application_method: Mapped[str | None] = mapped_column(String(200))
    yield_benefit: Mapped[str | None] = mapped_column(String(200))
    quality_benefit: Mapped[str | None] = mapped_column(String(200))
    risk_control: Mapped[str | None] = mapped_column(Text)
    understanding_points: Mapped[list | None] = mapped_column(JSON)
    content_md: Mapped[str | None] = mapped_column(Text)
    source_citation: Mapped[str | None] = mapped_column(String(500))
    authors: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    paper_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("papers.id"))
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
```

`backend/src/biogas/models/paper.py`:
```python
import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from biogas.database import Base


class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str | None] = mapped_column(String(200))
    authors: Mapped[str | None] = mapped_column(String(500))
    journal: Mapped[str | None] = mapped_column(String(200))
    year: Mapped[int | None] = mapped_column(Integer)
    file_path: Mapped[str] = mapped_column(String(500))
    parsed_path: Mapped[str | None] = mapped_column(String(500))
    file_size: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="uploading", index=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    article_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("articles.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

`backend/src/biogas/models/qa.py`:
```python
import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from biogas.database import Base


class QAMessage(Base):
    __tablename__ = "qa_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    article_id: Mapped[str] = mapped_column(String(36), ForeignKey("articles.id"), index=True)
    session_id: Mapped[str] = mapped_column(String(100), index=True)
    role: Mapped[str] = mapped_column(String(10))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

- [ ] **Step 5: Create main.py**

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from biogas.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="沼液还田科普平台 API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
```

- [ ] **Step 6: Create alembic configuration**

`backend/alembic.ini`:
```ini
[alembic]
script_location = alembic
sqlalchemy.url = sqlite+aiosqlite:///./data/biogas.db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

`backend/alembic/env.py`:
```python
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from biogas.config import settings
from biogas.database import Base
from biogas.models import User, Article, Paper, QAMessage  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 7: Generate initial migration**

Run from `backend/` directory:
```bash
cd backend && alembic revision --autogenerate -m "initial" && cd ..
```

- [ ] **Step 8: Create .env.example and .gitignore**

`.env.example`:
```bash
# Database
DATABASE_URL=sqlite+aiosqlite:///./data/biogas.db

# AI
DASHSCOPE_API_KEY=sk-xxx
DASHSCOPE_MODEL=qwen-plus

# MinerU
MINERU_MODEL_SIZE=small

# WeChat OAuth
WECHAT_APPID=wx_xxx
WECHAT_APPSECRET=xxx
WECHAT_REDIRECT_URL=https://biogas.bio-spring.top/api/auth/wechat/callback

# OSS
ALIYUN_OSS_ACCESS_KEY=xxx
ALIYUN_OSS_SECRET_KEY=xxx
ALIYUN_OSS_BUCKET=biogas-papers
ALIYUN_OSS_ENDPOINT=oss-cn-qingdao.aliyuncs.com

# Auth
JWT_SECRET=your-secret-key
ADMIN_WECHAT_OPENID=xxx

# App
BASE_URL=https://biogas.bio-spring.top
```

`.gitignore`:
```
# Python
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.venv/
*.db

# Environment
.env

# Data
backend/data/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Node
node_modules/
.next/
frontend/.next/

# Superpowers
.superpowers/
```

- [ ] **Step 9: Verify backend starts**

```bash
cd backend && pip install -e ".[dev]" && uvicorn biogas.main:app --port 8000 &
curl http://localhost:8000/api/health
# Expected: {"status":"ok"}
kill %1
```

- [ ] **Step 10: Commit**

```bash
git add backend/ .env.example .gitignore
git commit -m "feat: backend scaffolding with FastAPI, SQLAlchemy models, and Alembic"
```

---

## Task 2: Backend Schemas + API Dependencies

**Files:**
- Create: `backend/src/biogas/schemas/__init__.py`
- Create: `backend/src/biogas/schemas/auth.py`
- Create: `backend/src/biogas/schemas/article.py`
- Create: `backend/src/biogas/schemas/paper.py`
- Create: `backend/src/biogas/schemas/qa.py`
- Create: `backend/src/biogas/api/__init__.py`
- Create: `backend/src/biogas/api/deps.py`

- [ ] **Step 1: Create auth schemas**

```python
# backend/src/biogas/schemas/auth.py
from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserInfo(BaseModel):
    id: str
    name: str | None
    avatar_url: str | None
    is_admin: bool
```

- [ ] **Step 2: Create article schemas**

```python
# backend/src/biogas/schemas/article.py
from datetime import datetime

from pydantic import BaseModel


class ArticleBase(BaseModel):
    title: str
    subtitle: str | None = None
    slug: str
    category: str | None = None
    tags: list[str] | None = None
    slurry_type: str | None = None
    crop: str | None = None
    soil_type: str | None = None
    dosage: str | None = None
    application_method: str | None = None
    yield_benefit: str | None = None
    quality_benefit: str | None = None
    risk_control: str | None = None
    understanding_points: list[str] | None = None
    content_md: str | None = None
    source_citation: str | None = None
    authors: str | None = None


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    content_md: str | None = None
    understanding_points: list[str] | None = None
    status: str | None = None


class ArticleRead(ArticleBase):
    id: str
    status: str
    paper_id: str | None = None
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ArticleListItem(BaseModel):
    id: str
    title: str
    subtitle: str | None = None
    slug: str
    category: str | None = None
    status: str
    published_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
```

- [ ] **Step 3: Create paper and QA schemas**

```python
# backend/src/biogas/schemas/paper.py
from datetime import datetime

from pydantic import BaseModel


class PaperRead(BaseModel):
    id: str
    title: str | None = None
    authors: str | None = None
    journal: str | None = None
    year: int | None = None
    file_size: int | None = None
    status: str
    error_message: str | None = None
    article_id: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
```

```python
# backend/src/biogas/schemas/qa.py
from pydantic import BaseModel


class QARequest(BaseModel):
    article_id: str
    session_id: str
    question: str


class QAResponse(BaseModel):
    answer: str
    session_id: str
```

- [ ] **Step 4: Create API dependencies (auth middleware)**

```python
# backend/src/biogas/api/deps.py
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.config import settings
from biogas.database import get_db
from biogas.models.user import User

security = HTTPBearer(auto_error=False)


def create_access_token(openid: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.jwt_expire_days)
    return jwt.encode({"sub": openid, "exp": expire}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        openid: str = payload.get("sub")
        if openid is None:
            return None
    except JWTError:
        return None
    result = await db.execute(select(User).where(User.wechat_openid == openid))
    return result.scalar_one_or_none()


async def require_user(user: User | None = Depends(get_current_user)) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未登录")
    return user


async def require_admin(user: User = Depends(require_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="需要管理员权限")
    return user
```

- [ ] **Step 5: Create schemas __init__.py**

```python
# backend/src/biogas/schemas/__init__.py
from biogas.schemas.auth import TokenResponse, UserInfo
from biogas.schemas.article import ArticleCreate, ArticleUpdate, ArticleRead, ArticleListItem
from biogas.schemas.paper import PaperRead
from biogas.schemas.qa import QARequest, QAResponse
```

- [ ] **Step 6: Verify imports**

```bash
cd backend && python -c "from biogas.schemas import ArticleRead, TokenResponse; from biogas.api.deps import create_access_token; print('OK')"
# Expected: OK
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/biogas/schemas/ backend/src/biogas/api/
git commit -m "feat: Pydantic schemas and auth dependency injection"
```

---

## Task 3: OSS Service

**Files:**
- Create: `backend/src/biogas/services/__init__.py`
- Create: `backend/src/biogas/services/oss.py`
- Create: `backend/tests/test_services.py`

- [ ] **Step 1: Write the test**

```python
# backend/tests/test_services.py
import pytest
from unittest.mock import AsyncMock, patch, MagicMock


def test_oss_get_signed_url():
    from biogas.services.oss import OSSService
    with patch("biogas.services.oss.oss2") as mock_oss:
        mock_bucket = MagicMock()
        mock_oss.Bucket.return_value = mock_bucket
        mock_bucket.sign_url.return_value = "https://example.com/file.pdf?signature=xxx"

        service = OSSService.__new__(OSSService)
        service.bucket = mock_bucket

        url = service.get_signed_url("papers/test/file.pdf")
        assert url.startswith("https://example.com/file.pdf")
        mock_bucket.sign_url.assert_called_once()
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && pytest tests/test_services.py::test_oss_get_signed_url -v
# Expected: FAIL (OSSService not defined)
```

- [ ] **Step 3: Implement OSS service**

```python
# backend/src/biogas/services/oss.py
import oss2

from biogas.config import settings


class OSSService:
    def __init__(self):
        auth = oss2.Auth(settings.aliyun_oss_access_key, settings.aliyun_oss_secret_key)
        self.bucket = oss2.Bucket(auth, settings.aliyun_oss_endpoint, settings.aliyun_oss_bucket)

    async def upload_bytes(self, key: str, data: bytes) -> str:
        self.bucket.put_object(key, data)
        return key

    async def upload_file(self, key: str, file_path: str) -> str:
        self.bucket.put_object_from_file(key, file_path)
        return key

    async def download_bytes(self, key: str) -> bytes:
        return self.bucket.get_object(key).read()

    def get_signed_url(self, key: str, expires: int = 3600) -> str:
        return self.bucket.sign_url(key, expires)

    async def delete(self, key: str) -> None:
        self.bucket.delete_object(key)


oss_service = OSSService()
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend && pytest tests/test_services.py::test_oss_get_signed_url -v
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/biogas/services/ backend/tests/test_services.py
git commit -m "feat: Alibaba Cloud OSS service for file storage"
```

---

## Task 4: WeChat OAuth Service + Auth API

**Files:**
- Create: `backend/src/biogas/services/wechat.py`
- Create: `backend/src/biogas/api/auth.py`
- Create: `backend/tests/test_api_auth.py`

- [ ] **Step 1: Write the test**

```python
# backend/tests/test_api_auth.py
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient


def test_health():
    from biogas.main import app
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: Run test to verify it passes**

```bash
cd backend && pytest tests/test_api_auth.py::test_health -v
# Expected: PASS
```

- [ ] **Step 3: Implement WeChat service**

```python
# backend/src/biogas/services/wechat.py
import httpx

from biogas.config import settings


class WeChatService:
    TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token"
    USER_INFO_URL = "https://api.weixin.qq.com/sns/userinfo"
    QRCONNECT_URL = "https://open.weixin.qq.com/connect/qrconnect"

    async def get_qrconnect_url(self, state: str = "") -> str:
        params = {
            "appid": settings.wechat_appid,
            "redirect_uri": settings.wechat_redirect_url,
            "response_type": "code",
            "scope": "snsapi_login",
            "state": state,
        }
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.QRCONNECT_URL}?{query_string}#wechat_redirect"

    async def get_access_token(self, code: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                self.TOKEN_URL,
                params={
                    "appid": settings.wechat_appid,
                    "secret": settings.wechat_appsecret,
                    "code": code,
                    "grant_type": "authorization_code",
                },
            )
            data = resp.json()
            if "errcode" in data and data["errcode"] != 0:
                raise ValueError(f"WeChat error: {data}")
            return data

    async def get_user_info(self, access_token: str, openid: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                self.USER_INFO_URL,
                params={
                    "access_token": access_token,
                    "openid": openid,
                    "lang": "zh_CN",
                },
            )
            return resp.json()


wechat_service = WeChatService()
```

- [ ] **Step 4: Implement auth API routes**

```python
# backend/src/biogas/api/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.config import settings
from biogas.database import get_db
from biogas.api.deps import create_access_token, get_current_user
from biogas.models.user import User
from biogas.schemas.auth import TokenResponse, UserInfo
from biogas.services.wechat import wechat_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/wechat/qrcode")
async def get_qrcode():
    url = await wechat_service.get_qrconnect_url()
    return {"url": url}


@router.get("/wechat/callback", response_model=TokenResponse)
async def wechat_callback(code: str, db: AsyncSession = Depends(get_db)):
    try:
        token_data = await wechat_service.get_access_token(code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token = token_data["access_token"]
    openid = token_data["openid"]

    user_info = await wechat_service.get_user_info(access_token, openid)

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

    token = create_access_token(openid)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserInfo)
async def get_me(user: User = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="未登录")
    return UserInfo(
        id=user.id,
        name=user.name,
        avatar_url=user.avatar_url,
        is_admin=user.is_admin,
    )
```

- [ ] **Step 5: Register auth router in main.py**

```python
# backend/src/biogas/main.py — add after existing code
from biogas.api.auth import router as auth_router

app.include_router(auth_router)
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/biogas/services/wechat.py backend/src/biogas/api/auth.py backend/src/biogas/main.py
git commit -m "feat: WeChat OAuth login service and auth API endpoints"
```

---

## Task 5: Articles API + Papers API

**Files:**
- Create: `backend/src/biogas/api/articles.py`
- Create: `backend/src/biogas/api/papers.py`
- Create: `backend/src/biogas/api/admin.py`

- [ ] **Step 1: Create articles API**

```python
# backend/src/biogas/api/articles.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.database import get_db
from biogas.models.article import Article
from biogas.schemas.article import ArticleRead, ArticleListItem

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("", response_model=list[ArticleListItem])
async def list_articles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article).where(Article.status == "published").order_by(Article.published_at.desc())
    )
    return result.scalars().all()


@router.get("/{slug}", response_model=ArticleRead)
async def get_article(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.slug == slug, Article.status == "published"))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return article
```

- [ ] **Step 2: Create papers API**

```python
# backend/src/biogas/api/papers.py
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.database import get_db
from biogas.api.deps import require_admin
from biogas.models.paper import Paper
from biogas.models.user import User
from biogas.schemas.paper import PaperRead
from biogas.services.oss import oss_service

router = APIRouter(prefix="/api/papers", tags=["papers"])


@router.post("/upload", response_model=PaperRead)
async def upload_paper(
    file: UploadFile,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="仅支持 PDF 文件")

    paper_id = str(uuid.uuid4())
    oss_key = f"papers/{paper_id}/{file.filename}"
    content = await file.read()

    await oss_service.upload_bytes(oss_key, content)

    paper = Paper(
        id=paper_id,
        file_path=oss_key,
        file_size=len(content),
        status="uploading",
    )
    db.add(paper)
    await db.commit()
    return paper


@router.post("/{paper_id}/process")
async def trigger_processing(
    paper_id: str,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Paper).where(Paper.id == paper_id))
    paper = result.scalar_one_or_none()
    if paper is None:
        raise HTTPException(status_code=404, detail="论文不存在")

    paper.status = "processing"
    await db.commit()

    # Enqueue arq task (import here to avoid circular dependency)
    from biogas.tasks.process_paper import process_paper
    from arq import create_pool
    from arq.connections import RedisSettings

    # For now, run synchronously; will be configured with Redis in Task 8
    import asyncio
    asyncio.create_task(process_paper(paper_id))

    return {"status": "processing"}


@router.get("/{paper_id}", response_model=PaperRead)
async def get_paper(paper_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Paper).where(Paper.id == paper_id))
    paper = result.scalar_one_or_none()
    if paper is None:
        raise HTTPException(status_code=404, detail="论文不存在")
    return paper
```

- [ ] **Step 3: Create admin API**

```python
# backend/src/biogas/api/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.database import get_db
from biogas.api.deps import require_admin
from biogas.models.article import Article
from biogas.models.paper import Paper
from biogas.models.user import User
from biogas.schemas.article import ArticleRead, ArticleUpdate
from biogas.schemas.paper import PaperRead

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/papers", response_model=list[PaperRead])
async def list_papers(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Paper).order_by(Paper.created_at.desc()))
    return result.scalars().all()


@router.get("/articles", response_model=list[ArticleRead])
async def list_all_articles(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Article).order_by(Article.created_at.desc()))
    return result.scalars().all()


@router.put("/articles/{article_id}", response_model=ArticleRead)
async def update_article(
    article_id: str,
    data: ArticleUpdate,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=404, detail="文章不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(article, key, value)
    await db.commit()
    await db.refresh(article)
    return article
```

- [ ] **Step 4: Register all routers in main.py**

```python
# Update backend/src/biogas/main.py
from biogas.api.auth import router as auth_router
from biogas.api.articles import router as articles_router
from biogas.api.papers import router as papers_router
from biogas.api.admin import router as admin_router

app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(papers_router)
app.include_router(admin_router)
```

- [ ] **Step 5: Verify all routes registered**

```bash
cd backend && uvicorn biogas.main:app --port 8000 &
curl http://localhost:8000/openapi.json | python -m json.tool | grep -c "path"
# Expected: number of API paths > 0
kill %1
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/biogas/api/
git commit -m "feat: articles, papers, and admin API endpoints"
```

---

## Task 6: MinerU PDF Parser Service

**Files:**
- Create: `backend/src/biogas/services/pdf_parser.py`

- [ ] **Step 1: Implement PDF parser service**

```python
# backend/src/biogas/services/pdf_parser.py
import subprocess
import tempfile
import os

from biogas.config import settings
from biogas.services.oss import oss_service


class PDFParser:
    async def parse(self, paper_id: str, oss_key: str) -> str:
        # Check for cached parsed result
        parsed_key = f"papers/{paper_id}/parsed.md"
        try:
            cached = await oss_service.download_bytes(parsed_key)
            return cached.decode("utf-8")
        except Exception:
            pass  # No cache, proceed with parsing

        # Download PDF from OSS to temp file
        pdf_bytes = await oss_service.download_bytes(oss_key)
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name

        try:
            # Call MinerU CLI to parse PDF
            output_dir = tempfile.mkdtemp()
            result = subprocess.run(
                [
                    "magic-pdf",
                    "-p", tmp_path,
                    "-o", output_dir,
                    "-m", settings.mineru_model_size,
                ],
                capture_output=True,
                text=True,
                timeout=300,
            )

            if result.returncode != 0:
                raise RuntimeError(f"MinerU failed: {result.stderr}")

            # Find the generated markdown file
            pdf_name = os.path.splitext(os.path.basename(tmp_path))[0]
            md_path = os.path.join(output_dir, pdf_name, f"{pdf_name}.md")

            if not os.path.exists(md_path):
                # Try auto directory structure
                md_path = os.path.join(output_dir, "auto", f"{pdf_name}.md")

            with open(md_path, "r", encoding="utf-8") as f:
                parsed_content = f.read()

            # Cache to OSS
            await oss_service.upload_bytes(parsed_key, parsed_content.encode("utf-8"))

            return parsed_content
        finally:
            os.unlink(tmp_path)


pdf_parser = PDFParser()
```

- [ ] **Step 2: Verify MinerU is available on system**

```bash
which magic-pdf || echo "MinerU not installed - install via: pip install magic-pdf[full]"
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/biogas/services/pdf_parser.py
git commit -m "feat: MinerU PDF parser service with OSS caching"
```

---

## Task 7: AI Pipeline Service + Prompt

**Files:**
- Create: `backend/src/biogas/services/ai_pipeline.py`
- Create: `backend/src/biogas/prompts/paper_interpretation.txt`

- [ ] **Step 1: Create the AI prompt template**

```
# backend/src/biogas/prompts/paper_interpretation.txt
你是一位农业科技传播专家。请基于以下学术论文内容，生成一篇面向农业从业者（农户和农技人员）的科普文章和结构化数据。

要求：
1. 语言准确、清晰、尊重读者。专业术语可用，首次出现时简要解释。数据呈现为主。
2. 文章结构完整，包含研究团队、研究背景、研究方法、核心发现、实践建议、风险提示和未来展望。
3. 输出严格的 JSON 格式（不要输出 markdown 代码块标记）。

论文内容如下：

{paper_content}

请输出以下 JSON 结构：

{{
    "title": "科普化标题（简明扼要，突出核心发现）",
    "subtitle": "副标题（一句话说明价值）",
    "slurry_type": "沼液类型（猪粪/鸡粪/牛粪等）",
    "crop": "适用作物",
    "soil_type": "适用土壤类型",
    "dosage": "用量（含单位，如：约20吨/亩）",
    "application_method": "施用方式和时机",
    "yield_benefit": "产量收益（对比化肥的数据）",
    "quality_benefit": "品质收益",
    "risk_control": "风险控制措施",
    "understanding_points": ["明白卡要点1（≤20字）", "要点2", "要点3", "要点4", "要点5", "要点6"],
    "category": "分类（水稻/小麦/蔬菜/果树/土壤改良/综合）",
    "tags": ["标签1", "标签2"],
    "source_citation": "文献引用信息（期刊名, 年份, 卷期: 页码）",
    "authors": "论文作者",
    "full_article_md": "完整的科普文章 Markdown 内容，包含以下章节：\\n# 一句话结论\\n## 研究团队\\n## 为什么要做这个研究\\n## 研究怎么做的\\n## 核心发现\\n## 农户怎么用\\n## 有什么风险要注意\\n## 未来展望"
}}
```

- [ ] **Step 2: Implement AI pipeline service**

```python
# backend/src/biogas/services/ai_pipeline.py
import json
import re
from pathlib import Path

from openai import AsyncOpenAI

from biogas.config import settings

PROMPT_TEMPLATE = Path(__file__).parent.parent / "prompts" / "paper_interpretation.txt"


class AIPipeline:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.dashscope_api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        self.model = settings.dashscope_model

    async def interpret_paper(self, paper_content: str) -> dict:
        prompt = PROMPT_TEMPLATE.read_text(encoding="utf-8").replace("{paper_content}", paper_content)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "你是一位农业科技传播专家，擅长将学术论文转化为通俗易懂的科普文章。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=8000,
        )

        content = response.choices[0].message.content

        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", content, re.DOTALL)
        if json_match:
            content = json_match.group(1)

        return json.loads(content)


ai_pipeline = AIPipeline()
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/biogas/services/ai_pipeline.py backend/src/biogas/prompts/
git commit -m "feat: AI paper interpretation pipeline with Dashscope Qwen"
```

---

## Task 8: arq Task Queue + Processing Pipeline

**Files:**
- Create: `backend/src/biogas/tasks/__init__.py`
- Create: `backend/src/biogas/tasks/process_paper.py`

- [ ] **Step 1: Create arq worker settings and task**

```python
# backend/src/biogas/tasks/__init__.py
```

```python
# backend/src/biogas/tasks/process_paper.py
import asyncio
import re
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.database import async_session
from biogas.models.paper import Paper
from biogas.models.article import Article
from biogas.services.oss import oss_service
from biogas.services.pdf_parser import pdf_parser
from biogas.services.ai_pipeline import ai_pipeline


def make_slug(title: str) -> str:
    # Simple slug: remove non-alphanumeric chars, replace spaces with hyphens
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug[:100]


async def process_paper(paper_id: str):
    async with async_session() as db:
        result = await db.execute(select(Paper).where(Paper.id == paper_id))
        paper = result.scalar_one_or_none()
        if paper is None:
            return

        try:
            # Step 1: Parse PDF
            parsed_content = await pdf_parser.parse(paper_id, paper.file_path)
            paper.parsed_path = f"papers/{paper_id}/parsed.md"
            await db.commit()

            # Step 2: AI Interpretation
            ai_result = await ai_pipeline.interpret_paper(parsed_content)

            # Step 3: Create article
            article = Article(
                title=ai_result["title"],
                subtitle=ai_result.get("subtitle"),
                slug=make_slug(ai_result["title"]),
                category=ai_result.get("category"),
                tags=ai_result.get("tags"),
                slurry_type=ai_result.get("slurry_type"),
                crop=ai_result.get("crop"),
                soil_type=ai_result.get("soil_type"),
                dosage=ai_result.get("dosage"),
                application_method=ai_result.get("application_method"),
                yield_benefit=ai_result.get("yield_benefit"),
                quality_benefit=ai_result.get("quality_benefit"),
                risk_control=ai_result.get("risk_control"),
                understanding_points=ai_result.get("understanding_points"),
                content_md=ai_result.get("full_article_md"),
                source_citation=ai_result.get("source_citation"),
                authors=ai_result.get("authors"),
                status="published",
                paper_id=paper.id,
                published_at=datetime.now(timezone.utc),
            )
            db.add(article)

            paper.status = "completed"
            paper.article_id = article.id
            await db.commit()

        except Exception as e:
            paper.status = "failed"
            paper.error_message = str(e)
            await db.commit()
            raise


# arq worker settings
class WorkerSettings:
    functions = [process_paper]
    redis_settings = None  # Will be configured when Redis is available
```

- [ ] **Step 2: Update papers API to use async task properly**

```python
# Update the trigger_processing endpoint in backend/src/biogas/api/papers.py
# Replace the asyncio.create_task line with:

    # Enqueue task - for now run in background without Redis
    import asyncio
    asyncio.create_task(process_paper(paper_id))

    return {"status": "processing"}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/biogas/tasks/
git commit -m "feat: arq task queue with paper processing pipeline"
```

---

## Task 9: Q&A Engine Service + API

**Files:**
- Create: `backend/src/biogas/services/qa_engine.py`
- Create: `backend/src/biogas/api/qa.py`

- [ ] **Step 1: Implement QA engine**

```python
# backend/src/biogas/services/qa_engine.py
from openai import AsyncOpenAI

from biogas.config import settings


class QAEngine:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.dashscope_api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        self.model = settings.dashscope_model

    async def answer(self, question: str, article_content: str) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "你是一位农业科技问答助手。请基于提供的文章内容回答用户问题。"
                    "如果文章中没有相关信息，请直接说明文章未提及此内容。不要编造信息。",
                },
                {
                    "role": "user",
                    "content": f"文章内容：\n\n{article_content}\n\n用户问题：{question}",
                },
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        return response.choices[0].message.content


qa_engine = QAEngine()
```

- [ ] **Step 2: Create QA API**

```python
# backend/src/biogas/api/qa.py
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from biogas.database import get_db
from biogas.models.article import Article
from biogas.models.qa import QAMessage
from biogas.schemas.qa import QARequest, QAResponse
from biogas.services.qa_engine import qa_engine

router = APIRouter(prefix="/api/qa", tags=["qa"])


@router.post("", response_model=QAResponse)
async def ask_question(data: QARequest, db: AsyncSession = Depends(get_db)):
    # Get article
    result = await db.execute(select(Article).where(Article.id == data.article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=404, detail="文章不存在")

    # Save user message
    user_msg = QAMessage(
        article_id=data.article_id,
        session_id=data.session_id,
        role="user",
        content=data.question,
    )
    db.add(user_msg)

    # Get answer
    answer = await qa_engine.answer(data.question, article.content_md or "")

    # Save assistant message
    assistant_msg = QAMessage(
        article_id=data.article_id,
        session_id=data.session_id,
        role="assistant",
        content=answer,
    )
    db.add(assistant_msg)
    await db.commit()

    return QAResponse(answer=answer, session_id=data.session_id)
```

- [ ] **Step 3: Register QA router in main.py**

```python
# Add to backend/src/biogas/main.py imports and include_router
from biogas.api.qa import router as qa_router
app.include_router(qa_router)
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/biogas/services/qa_engine.py backend/src/biogas/api/qa.py backend/src/biogas/main.py
git commit -m "feat: article-level Q&A engine with Dashscope"
```

---

## Task 10: Frontend Project Setup + Homepage

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/globals.css`
- Create: `frontend/src/app/page.tsx`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/stores/auth.ts`
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/HeroBanner.tsx`
- Create: `frontend/src/components/ArticleCard.tsx`
- Create: `frontend/.env.local`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd frontend && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

- [ ] **Step 2: Install additional dependencies**

```bash
cd frontend && npm install @tanstack/react-query zustand react-markdown remark-gfm html2canvas
```

- [ ] **Step 3: Create API utility**

```typescript
// frontend/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "请求失败" }));
    throw new Error(error.detail || "请求失败");
  }
  return res.json();
}
```

- [ ] **Step 4: Create auth store**

```typescript
// frontend/src/stores/auth.ts
import { create } from "zustand";

interface User {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.is_admin ?? false,
}));
```

- [ ] **Step 5: Create layout with Header**

```tsx
// frontend/src/components/Header.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-emerald-700">
          沼液还田科普站
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-emerald-700">
            文章
          </Link>
          {user?.is_admin && (
            <Link href="/admin" className="text-gray-600 hover:text-emerald-700">
              管理
            </Link>
          )}
          {user ? (
            <button onClick={logout} className="text-gray-600 hover:text-red-600">
              退出
            </button>
          ) : (
            <Link href="/login" className="text-gray-600 hover:text-emerald-700">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

```tsx
// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "沼液还田科普站",
  description: "科学种田 · 绿色循环 · 乡村振兴",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create React Query provider**

```tsx
// frontend/src/app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 7: Create HeroBanner and ArticleCard components**

```tsx
// frontend/src/components/HeroBanner.tsx
export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">沼液还田科普站</h1>
        <p className="text-emerald-100 text-lg">科学种田 · 绿色循环 · 乡村振兴</p>
      </div>
    </div>
  );
}
```

```tsx
// frontend/src/components/ArticleCard.tsx
import Link from "next/link";

interface ArticleCardProps {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  category: string | null;
  published_at: string | null;
}

export default function ArticleCard({ title, subtitle, slug, category, published_at }: ArticleCardProps) {
  return (
    <Link href={`/posts/${slug}`} className="block border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mb-2">{subtitle}</p>}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {category && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{category}</span>}
            {published_at && <span>{new Date(published_at).toLocaleDateString("zh-CN")}</span>}
          </div>
        </div>
        <span className="text-gray-300 text-lg ml-4">→</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 8: Create homepage**

```tsx
// frontend/src/app/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import HeroBanner from "@/components/HeroBanner";
import ArticleCard from "@/components/ArticleCard";
import { fetchAPI } from "@/lib/api";

interface ArticleListItem {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  category: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function HomePage() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => fetchAPI<ArticleListItem[]>("/articles"),
  });

  return (
    <div>
      <HeroBanner />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">科普文章</h2>
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : articles && articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">暂无文章</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create .env.local**

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

- [ ] **Step 10: Verify frontend starts**

```bash
cd frontend && npm run dev &
# Open http://localhost:3000 - should show hero banner and article list
kill %1
```

- [ ] **Step 11: Commit**

```bash
git add frontend/
git commit -m "feat: Next.js frontend setup with homepage, header, and article list"
```

---

## Task 11: Frontend Article Page + Understanding Card

**Files:**
- Create: `frontend/src/app/posts/[slug]/page.tsx`
- Create: `frontend/src/components/UnderstandingCard.tsx`
- Create: `frontend/src/components/ShareCardButton.tsx`

- [ ] **Step 1: Create UnderstandingCard component**

```tsx
// frontend/src/components/UnderstandingCard.tsx
interface UnderstandingCardProps {
  slurry_type: string | null;
  crop: string | null;
  soil_type: string | null;
  dosage: string | null;
  application_method: string | null;
  yield_benefit: string | null;
  risk_control: string | null;
  understanding_points: string[] | null;
}

export default function UnderstandingCard(props: UnderstandingCardProps) {
  if (!props.understanding_points || props.understanding_points.length === 0) {
    return null;
  }

  return (
    <div id="understanding-card" className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📌</span>
        <h3 className="font-bold text-emerald-800">明白卡要点</h3>
      </div>
      <ul className="space-y-2">
        {props.understanding_points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Create ShareCardButton component**

```tsx
// frontend/src/components/ShareCardButton.tsx
"use client";

import html2canvas from "html2canvas";

export default function ShareCardButton() {
  const handleShare = async () => {
    const card = document.getElementById("understanding-card");
    if (!card) return;

    const canvas = await html2canvas(card, { backgroundColor: "#ecfdf5", scale: 2 });
    const link = document.createElement("a");
    link.download = "明白卡.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    const card = document.getElementById("understanding-card");
    if (!card) return;

    const canvas = await html2canvas(card, { backgroundColor: "#ecfdf5", scale: 2 });
    canvas.toBlob(async (blob) => {
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("已复制到剪贴板，可直接粘贴到微信");
      }
    });
  };

  return (
    <div className="flex gap-3 mb-6">
      <button onClick={handleShare} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
        下载明白卡
      </button>
      <button onClick={handleCopy} className="text-sm border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50">
        复制到剪贴板
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create article page**

```tsx
// frontend/src/app/posts/[slug]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UnderstandingCard from "@/components/UnderstandingCard";
import ShareCardButton from "@/components/ShareCardButton";
import QAPanel from "@/components/QAPanel";
import { fetchAPI } from "@/lib/api";

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  category: string | null;
  slurry_type: string | null;
  crop: string | null;
  soil_type: string | null;
  dosage: string | null;
  application_method: string | null;
  yield_benefit: string | null;
  quality_benefit: string | null;
  risk_control: string | null;
  understanding_points: string[] | null;
  content_md: string | null;
  source_citation: string | null;
  authors: string | null;
  published_at: string | null;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchAPI<Article>(`/articles/${slug}`),
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">加载中...</div>;
  if (!article) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">文章不存在</div>;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
          {article.category && (
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{article.category}</span>
          )}
          {article.published_at && <span>{new Date(article.published_at).toLocaleDateString("zh-CN")}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h1>
        {article.subtitle && <p className="text-gray-500">{article.subtitle}</p>}
        {article.authors && <p className="text-sm text-gray-400 mt-2">{article.authors}</p>}
      </header>

      <UnderstandingCard {...article} />
      <ShareCardButton />

      <div className="prose prose-emerald max-w-none mb-12">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content_md || ""}</ReactMarkdown>
      </div>

      {article.source_citation && (
        <div className="border-t pt-6 mb-8 text-sm text-gray-500">
          <strong>原始文献：</strong>{article.source_citation}
        </div>
      )}

      <QAPanel articleId={article.id} />
    </article>
  );
}
```

- [ ] **Step 4: Verify article page renders**

```bash
cd frontend && npm run dev &
# Visit http://localhost:3000/posts/test-slug - should show article layout (even if empty)
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/posts/ frontend/src/components/UnderstandingCard.tsx frontend/src/components/ShareCardButton.tsx
git commit -m "feat: article page with understanding card and share functionality"
```

---

## Task 12: Frontend Q&A Panel + Login Dialog

**Files:**
- Create: `frontend/src/components/QAPanel.tsx`
- Create: `frontend/src/components/LoginDialog.tsx`
- Create: `frontend/src/app/login/page.tsx`

- [ ] **Step 1: Create QAPanel component**

```tsx
// frontend/src/components/QAPanel.tsx
"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QAPanelProps {
  articleId: string;
}

export default function QAPanel({ articleId }: QAPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const q = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await fetchAPI<{ answer: string }>("/qa", {
        method: "POST",
        body: JSON.stringify({ article_id: articleId, session_id: sessionId, question: q }),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "抱歉，回答失败，请稍后重试。" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-900 mb-4">向本文提问</h3>

      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`text-sm p-3 rounded-lg ${msg.role === "user" ? "bg-blue-50 text-blue-900 ml-8" : "bg-gray-50 text-gray-900 mr-8"}`}>
              {msg.content}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入您的问题..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "..." : "提问"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create LoginDialog component**

```tsx
// frontend/src/components/LoginDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (open) {
      fetchAPI<{ url: string }>("/auth/wechat/qrcode").then((data) => setQrUrl(data.url));
    }
  }, [open]);

  // Handle OAuth callback (when user scans QR code, redirected back with token)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      fetchAPI<{ id: string; name: string; avatar_url: string; is_admin: boolean }>("/auth/me").then((user) => {
        setAuth(user, token);
        window.history.replaceState({}, "", window.location.pathname);
        onClose();
      });
    }
  }, [setAuth, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-center mb-6">微信扫码登录</h3>
        {qrUrl ? (
          <iframe src={qrUrl} className="w-full h-80 border-0" title="微信登录" />
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">加载中...</div>
        )}
        <p className="text-xs text-gray-400 text-center mt-4">
          扫码后即可下载论文原文
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create login page**

```tsx
// frontend/src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { fetchAPI } from "@/lib/api";

export default function LoginPage() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/");
      return;
    }
    fetchAPI<{ url: string }>("/auth/wechat/qrcode").then((data) => setQrUrl(data.url));
  }, [user, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      fetchAPI<{ id: string; name: string; avatar_url: string; is_admin: boolean }>("/auth/me").then((userData) => {
        setAuth(userData, token);
        router.push("/");
      });
    }
  }, [setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 shadow-sm">
        <h1 className="text-xl font-bold text-center mb-6">登录</h1>
        {qrUrl ? (
          <iframe src={qrUrl} className="w-full h-80 border-0" title="微信登录" />
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">加载二维码中...</div>
        )}
        <p className="text-xs text-gray-400 text-center mt-4">使用微信扫码登录</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/QAPanel.tsx frontend/src/components/LoginDialog.tsx frontend/src/app/login/
git commit -m "feat: Q&A panel and WeChat QR login dialog"
```

---

## Task 13: Frontend Admin CMS

**Files:**
- Create: `frontend/src/app/admin/page.tsx`
- Create: `frontend/src/components/PaperUpload.tsx`

- [ ] **Step 1: Create PaperUpload component**

```tsx
// frontend/src/components/PaperUpload.tsx
"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

export default function PaperUpload() {
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/papers/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("上传失败");
      return res.json();
    },
    onSuccess: (paper) => {
      fetchAPI(`/papers/${paper.id}/process`, { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["admin-papers"] });
    },
  });

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.name.endsWith(".pdf")) {
        uploadMutation.mutate(file);
      }
    });
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
    >
      <p className="text-gray-500 mb-2">拖拽 PDF 文件到此处，或</p>
      <button
        onClick={() => fileInput.current?.click()}
        className="text-emerald-600 font-medium hover:underline"
      >
        点击选择文件
      </button>
      <input
        ref={fileInput}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {uploadMutation.isPending && <p className="text-sm text-emerald-600 mt-3">上传中...</p>}
    </div>
  );
}
```

- [ ] **Step 2: Create admin page**

```tsx
// frontend/src/app/admin/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PaperUpload from "@/components/PaperUpload";
import { fetchAPI } from "@/lib/api";

interface Paper {
  id: string;
  title: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  uploading: { text: "上传中", color: "text-blue-600 bg-blue-50" },
  processing: { text: "处理中", color: "text-amber-600 bg-amber-50" },
  completed: { text: "已完成", color: "text-emerald-600 bg-emerald-50" },
  failed: { text: "失败", color: "text-red-600 bg-red-50" },
};

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.is_admin) router.push("/");
  }, [user, router]);

  const { data: papers } = useQuery({
    queryKey: ["admin-papers"],
    queryFn: () => fetchAPI<Paper[]>("/admin/papers"),
    enabled: !!user?.is_admin,
  });

  if (!user?.is_admin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理后台</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">上传文献</h2>
        <PaperUpload />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">文献列表</h2>
        {papers && papers.length > 0 ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">文件名</th>
                  <th className="text-left px-4 py-3">状态</th>
                  <th className="text-left px-4 py-3">上传时间</th>
                  <th className="text-left px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper) => {
                  const status = STATUS_LABELS[paper.status] || STATUS_LABELS.uploading;
                  return (
                    <tr key={paper.id} className="border-t">
                      <td className="px-4 py-3">{paper.title || paper.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${status.color}`}>{status.text}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(paper.created_at).toLocaleDateString("zh-CN")}</td>
                      <td className="px-4 py-3">
                        {paper.status === "failed" && (
                          <button
                            onClick={() => fetchAPI(`/papers/${paper.id}/process`, { method: "POST" })}
                            className="text-sm text-emerald-600 hover:underline"
                          >
                            重试
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">暂无文献</p>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/admin/ frontend/src/components/PaperUpload.tsx
git commit -m "feat: admin CMS page with PDF upload and paper status management"
```

---

## Task 14: Backend + Frontend Integration Test

**Files:**
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_api_articles.py`

- [ ] **Step 1: Write integration test**

```python
# backend/tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from biogas.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

```python
# backend/tests/test_api_articles.py
import pytest


@pytest.mark.asyncio
async def test_list_articles_empty(client):
    response = await client.get("/api/articles")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
```

- [ ] **Step 2: Run integration tests**

```bash
cd backend && pytest tests/ -v
# Expected: PASS
```

- [ ] **Step 3: Full stack smoke test**

```bash
# Terminal 1
cd backend && uvicorn biogas.main:app --port 8000 &

# Terminal 2
cd frontend && npm run dev &

# Verify both are running
curl http://localhost:8000/api/health
curl http://localhost:3000 | grep -o "沼液还田科普站"

kill %1 %2
```

- [ ] **Step 4: Commit**

```bash
git add backend/tests/
git commit -m "test: integration tests for backend API"
```

---

## Task 15: Deployment Configuration

**Files:**
- Create: `scripts/deploy.sh`

- [ ] **Step 1: Create deployment script**

```bash
#!/bin/bash
# scripts/deploy.sh
# Run this on the server (139.129.128.105)

set -e

APP_DIR="/opt/biogas"
REPO_URL="https://github.com/SyntheticCommunity/biogas-flyer.git"

echo "=== 沼液还田科普平台部署脚本 ==="

# Install system dependencies
echo "1. 安装系统依赖..."
sudo apt update && sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx certbot python3-certbot-nginx

# Install Node.js 20 if needed
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Clone or update repo
echo "2. 拉取代码..."
if [ -d "$APP_DIR" ]; then
    cd $APP_DIR && git pull
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Backend setup
echo "3. 配置后端..."
cd $APP_DIR/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Create data directory
mkdir -p data

# Run migrations
alembic upgrade head

# Frontend setup
echo "4. 配置前端..."
cd $APP_DIR/frontend
npm install
npm run build

# Install MinerU
echo "5. 安装 MinerU..."
pip install magic-pdf[full]

# Create systemd services
echo "6. 配置 systemd 服务..."

sudo tee /etc/systemd/system/biogas-api.service > /dev/null <<EOF
[Unit]
Description=Biogas API Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/backend
Environment=PATH=$APP_DIR/backend/.venv/bin
ExecStart=$APP_DIR/backend/.venv/bin/uvicorn biogas.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/biogas-frontend.service > /dev/null <<EOF
[Unit]
Description=Biogas Frontend Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/frontend
ExecStart=$(which npx) next start -p 3000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Nginx config
echo "7. 配置 Nginx..."
sudo tee /etc/nginx/sites-available/biogas > /dev/null <<EOF
server {
    listen 80;
    server_name biogas.bio-spring.top;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 50M;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/biogas /etc/nginx/sites-enabled/biogas
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Start services
echo "8. 启动服务..."
sudo systemctl daemon-reload
sudo systemctl enable biogas-api biogas-frontend
sudo systemctl start biogas-api biogas-frontend

# SSL
echo "9. 配置 SSL..."
sudo certbot --nginx -d biogas.bio-spring.top --non-interactive --agree-tos --email admin@bio-spring.top || echo "SSL配置跳过，稍后手动运行 certbot"

echo "=== 部署完成 ==="
echo "访问: https://biogas.bio-spring.top"
```

- [ ] **Step 2: Make script executable**

```bash
chmod +x scripts/deploy.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/
git commit -m "feat: server deployment script for Alibaba Cloud"
```

---

## Task 16: First Article Migration

**Files:**
- Create: `scripts/migrate_first_article.py`

- [ ] **Step 1: Create migration script for existing Hugo article**

```python
# scripts/migrate_first_article.py
"""
Migrates the first article from the Hugo site to the new database.
Run after the backend is set up and running.
"""
import asyncio
import json
import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from biogas.database import async_session
from biogas.models.article import Article

ARTICLE_DATA = {
    "title": "猪粪沼液还田：水稻增产提质实战指南",
    "subtitle": "打通种养循环，让化肥钱留在自己口袋里",
    "slug": "pig-slurry-rice-production",
    "category": "水稻",
    "tags": ["沼液还田", "增产", "田间试验", "水稻"],
    "slurry_type": "猪粪沼液",
    "crop": "水稻",
    "soil_type": "水稻土（长江中下游典型水稻土）",
    "dosage": "约 20 吨/亩（纯氮约 8 公斤/亩）",
    "application_method": "分蘖期 + 灌浆期各施用一次",
    "yield_benefit": "比化肥增产约 24%",
    "quality_benefit": "蛋白质含量提升 24%",
    "risk_control": "配套排水沟，避免连续阴雨天施用",
    "understanding_points": [
        "沼液类型：猪粪厌氧发酵沼液",
        "适用作物：水稻",
        "单次用量：约 20 吨/亩",
        "施用时机：分蘖期 + 灌浆期各一次",
        "预期收益：比化肥增产 24%",
        "风险提示：避免连续阴雨天施用",
    ],
    "source_citation": "植物营养与肥料学报 2023, 29(3): 483-495",
    "authors": "华中农业大学土壤健康与绿色农业团队",
    "status": "published",
    "published_at": datetime(2024, 6, 15, tzinfo=timezone.utc),
}


async def migrate():
    # Read the original markdown file
    with open("content/posts/2024-06-rice-slurry/index.md", "r", encoding="utf-8") as f:
        content = f.read()

    # Extract content after frontmatter
    parts = content.split("---", 2)
    if len(parts) >= 3:
        md_content = parts[2].strip()
    else:
        md_content = content

    async with async_session() as db:
        result = await db.execute(select(Article).where(Article.slug == ARTICLE_DATA["slug"]))
        if result.scalar_one_or_none():
            print("Article already exists, skipping.")
            return

        article = Article(
            id=str(uuid.uuid4()),
            **ARTICLE_DATA,
            content_md=md_content,
        )
        db.add(article)
        await db.commit()
        print(f"Article created: {article.title} (id={article.id})")


if __name__ == "__main__":
    asyncio.run(migrate())
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate_first_article.py
git commit -m "feat: migration script for first Hugo article"
```

---

## Summary

| Task | Description | Dependencies |
|:---|:---|:---|
| 1 | Backend scaffolding + models | None |
| 2 | Schemas + API deps | Task 1 |
| 3 | OSS service | Task 1 |
| 4 | WeChat auth service + API | Tasks 1, 2 |
| 5 | Articles + Papers + Admin API | Tasks 1, 2, 3 |
| 6 | MinerU PDF parser | Task 3 |
| 7 | AI pipeline + prompt | Task 1 |
| 8 | arq task queue | Tasks 5, 6, 7 |
| 9 | Q&A engine + API | Tasks 1, 2, 7 |
| 10 | Frontend setup + homepage | None |
| 11 | Article page + understanding card | Task 10 |
| 12 | Q&A panel + login dialog | Tasks 10, 4 |
| 13 | Admin CMS | Tasks 10, 5 |
| 14 | Integration tests | Tasks 1-13 |
| 15 | Deployment script | All |
| 16 | First article migration | Task 1 |

**Estimated effort:** Tasks 1-9 (backend) ~2-3 hours, Tasks 10-13 (frontend) ~2-3 hours, Tasks 14-16 (integration + deploy) ~1-2 hours.
