# 沼液还田科普平台 设计文档

## 概述

沼液还田科普平台是一个面向农户和农技人员的科研成果传播系统。核心能力是：管理员批量上传学术论文 PDF → AI 自动生成结构化科普文章和明白卡 → 用户阅读文章、下载原文、就文章内容提问。

**部署域名：** `biogas.bio-spring.top`
**部署位置：** 阿里云轻量应用服务器（1-2核 2GB 内存）

---

## 技术架构

### 技术栈

| 层面 | 技术选型 |
|:---|:---|
| 后端 | Python 3.11 + FastAPI + SQLAlchemy (async) + Alembic |
| 数据库 | SQLite + sqlite-vec（向量扩展） |
| 任务队列 | arq（基于 asyncio 的轻量队列） |
| PDF 解析 | MinerU（本地部署，小模型） |
| 前端 | Next.js 15 + React 19 + Tailwind CSS |
| AI 推理 | Dashscope Qwen API（云服务） |
| 短信服务 | 阿里云 SMS |
| 文件存储 | 阿里云 OSS（PDF 原文） |
| 部署 | Nginx + systemd，无 Docker |

### 架构图

```
用户浏览器
    │
    ▼
┌─────────────────────────────────────────────┐
│           阿里云轻量服务器                    │
│                                              │
│  Nginx                                       │
│    ├── / 反向代理 ──► Next.js server (3000)   │
│    └── /api/* 反向代理 ──► FastAPI (8000)     │
│                                              │
│  FastAPI Backend (uvicorn)                   │
│    ├── /api/auth         微信扫码登录         │
│    ├── /api/articles     文章管理             │
│    ├── /api/papers       PDF 上传/下载        │
│    ├── /api/qa           文章级问答           │
│    └── /api/admin        管理后台             │
│                                              │
│  MinerU (本地，小模型)                         │
│  SQLite + sqlite-vec                          │
│  arq worker (异步任务处理)                     │
└─────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    Dashscope API          阿里云 OSS
    (Qwen 推理)            (PDF + 解析缓存)
```

### 资源预算（2GB 服务器）

| 服务 | 内存占用 |
|:---|:---|
| Nginx | ~30MB |
| Next.js server (ISR) | ~150MB |
| FastAPI (uvicorn) | ~200MB |
| arq worker | ~100MB |
| MinerU (小模型) | ~500MB |
| SQLite (进程内) | ~10MB |
| 操作系统 | ~500MB |
| **合计** | **~1.49GB** |
| **剩余可用** | **~0.51GB** ✅ |

注意：MinerU 仅在处理 PDF 时占用内存，空闲时可释放。如内存紧张，可考虑升级到 4GB。

---

## 数据模型

### users 表

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | UUID | 主键 |
| phone | VARCHAR(20) | 手机号，唯一 |
| name | VARCHAR(100) | 昵称 |
| is_admin | BOOLEAN | 是否管理员 |
| created_at | TIMESTAMP | 创建时间 |

### articles 表

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | UUID | 主键 |
| title | VARCHAR(200) | 标题 |
| subtitle | VARCHAR(200) | 副标题 |
| category | VARCHAR(50) | 分类（水稻/小麦/蔬菜等） |
| tags | JSON | 标签数组 |
| slurry_type | VARCHAR(100) | 沼液类型 |
| crop | VARCHAR(100) | 适用作物 |
| soil_type | VARCHAR(100) | 适用土壤 |
| dosage | VARCHAR(200) | 单次用量 |
| application_method | VARCHAR(200) | 施用方式 |
| yield_benefit | VARCHAR(200) | 预期收益 |
| quality_benefit | VARCHAR(200) | 品质收益 |
| risk_control | TEXT | 风险控制措施 |
| understanding_points | JSON | 明白卡要点数组，6条以内 |
| content_md | TEXT | 完整文章（Markdown） |
| source_citation | VARCHAR(500) | 原始文献引用 |
| authors | VARCHAR(200) | 作者 |
| status | VARCHAR(20) | draft / published / failed |
| paper_id | UUID | 关联的论文 |
| published_at | TIMESTAMP | 发布时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### papers 表

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | UUID | 主键 |
| title | VARCHAR(200) | 论文标题 |
| authors | VARCHAR(500) | 论文作者 |
| journal | VARCHAR(200) | 期刊名称 |
| year | INTEGER | 发表年份 |
| file_path | VARCHAR(500) | OSS 存储路径（原始 PDF） |
| parsed_path | VARCHAR(500) | OSS 存储路径（MinerU 解析结果 Markdown） |
| file_size | INTEGER | 文件大小（bytes） |
| status | VARCHAR(20) | uploading / processing / completed / failed |
| error_message | TEXT | 失败原因 |
| article_id | UUID | 关联生成的文章 |
| created_at | TIMESTAMP | 上传时间 |

### qa_messages 表

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | UUID | 主键 |
| article_id | UUID | 关联文章 |
| session_id | VARCHAR(100) | 会话标识（匿名） |
| role | VARCHAR(10) | user / assistant |
| content | TEXT | 消息内容 |
| created_at | TIMESTAMP | 时间 |

---

## AI 管线

### 触发流程

1. 管理员通过管理后台上传 PDF（支持多文件拖拽）
2. 每个 PDF 创建一个 paper 记录（status=uploading），文件上传至阿里云 OSS
3. arq 异步队列逐个处理，状态变为 processing
4. 处理完成后自动发布，status=published

### 处理步骤

```
arq 任务接收 paper_id
    │
    ▼
Step 1: PDF 解析
    工具: MinerU（本地小模型）
    输入: OSS 上的 PDF 文件
    输出: 全文文本 + 表格结构化数据 + 图片
    缓存: 解析结果保存到 OSS papers/{id}/parsed.md
    │
    ▼
Step 2: AI 解读
    接口: Dashscope Qwen API
    输入: 论文全文文本
    输出: 结构化 JSON（见下方）
    │
    ▼
Step 3: 写入数据库
    将 JSON 各字段写入 articles 表
    paper.status = completed
    article.status = published
    │
    ▼
完成，前台可见
```

### AI Prompt 结构

系统 prompt 要求模型基于论文内容输出以下 JSON 结构：

**结构化字段（用于明白卡）：**
- `title` / `subtitle` — 科普化标题
- `slurry_type` — 沼液类型（猪粪/鸡粪/牛粪等）
- `crop` — 适用作物
- `soil_type` — 适用土壤
- `dosage` — 用量（含单位）
- `application_method` — 施用方式和时机
- `yield_benefit` — 产量收益
- `quality_benefit` — 品质收益
- `risk_control` — 风险控制措施
- `understanding_points` — 明白卡要点数组（≤6条，每条≤20字）

**文章正文 `full_article_md` 结构要求：**

```markdown
# 一句话结论

## 研究团队
（研究单位、团队背景）

## 为什么要做这个问题
（问题背景、农户的实际困惑）

## 研究怎么做的
（试验地点、时间跨度、对照组设计、检测指标）

## 核心发现
（表格 + 文字，对比数据）

## 咱们农户怎么用
（研究结论翻译成可操作步骤）

## 有什么风险要注意
（潜在问题和应对办法）

## 未来展望
（后续方向、对行业的意义）
```

**语言风格：** 准确、清晰、尊重读者。专业术语可用，首次出现时简要解释。数据呈现为主，避免居高临下的说教语气。

### 异常处理

- MinerU 本地解析失败 → paper.status = failed，记录 error_message
- AI 解析失败（格式错误、API 超时）→ paper.status = failed
- 管理员可在后台点击"重试"重新触发任务
- 重试时优先读取 OSS 上已缓存的 parsed.md，避免重复调用 MinerU

---

## 认证系统

### 登录流程

```
用户触发需要登录的操作（下载原文）
    │
    ▼
弹出登录框 ──► 显示微信扫码二维码
    │
    │   (用户用微信扫码确认授权)
    │
    ▼
微信回调 ──► 后端获取用户 openid
    │
    ▼
签发 JWT (有效期7天)
    │
    ▼
存储 token 到 localStorage ──► 执行原操作（下载）
```

### 微信登录接入

使用微信开放平台网站应用 OAuth2.0 授权：

1. 在微信开放平台注册网站应用，获取 `appid` 和 `appsecret`
2. 生成微信扫码二维码（`open.weixin.qq.com/connect/qrconnect`）
3. 用户扫码授权后，微信回调携带 `code`
4. 后端用 `code` 换取 `access_token` + `openid`
5. 用 `openid` 查找/创建用户，签发 JWT

### 规则

- 首次微信扫码登录即自动注册
- 管理员身份：`openid` 匹配配置文件中的管理员 openid → `is_admin=true`
- JWT 有效期 7 天

### 不需要登录的操作

- 浏览文章列表
- 阅读文章内容和明白卡
- 文章级知识问答
- 分享明白卡（生成图片）

---

## RAG 知识问答

### 方案

文章级问答，不使用向量检索，直接将全文作为上下文传给大模型：

```
用户在文章底部输入问题
    │
    ▼
取当前文章 content_md 全文
    │
    ▼
Dashscope Qwen API
prompt: "基于以下文章内容回答用户问题。
         如果文章中没有相关信息，请直接说明。
         \n\n文章内容：\n{full_article_md}"
    │
    ▼
返回答案
```

- 不需要 embedding 和向量检索
- 每篇文章长度有限，全文做 context 完全可行
- 明确要求 AI 不要编造文章中没有的信息

---

## 管理后台

### 访问方式

`/admin` 路径，仅管理员可访问（`is_admin=true`）

### 主界面

文章列表，包含状态筛选（全部 / 处理中 / 已发布 / 失败）：

| 文章标题 | 状态 | 上传时间 | 操作 |
|:---|:---|:---|:---|
| 猪粪沼液还田... | ✅ 已发布 | 2024-06-15 | 预览 / 编辑 |
| 鸡粪沼液对小麦... | ⏳ 处理中 | 2024-06-16 | — |
| 蔬菜大棚沼液... | ❌ 失败 | 2024-06-17 | 重试 |

### 功能

1. **批量上传 PDF** — 支持多文件拖拽，上传至 OSS，触发 arq 任务
2. **实时进度** — 处理中的文章显示进度状态
3. **文章预览** — 查看 AI 生成的明白卡和完整文章
4. **文章编辑** — 手动修改文章内容后重新发布
5. **失败重试** — 对处理失败的文章重新触发 AI 解读

---

## 前端页面

### 页面结构

```
/                  首页
├── Hero banner（站点标题 + 定位描述）
├── 最新发布（featured 文章卡片）
└── 全部文章列表

/posts/[slug]/      文章页
├── 文章标题 + 元信息（分类、日期、来源）
├── 明白卡区域（从结构化字段自动渲染）
│     └── [分享明白卡] 按钮 → 生成图片（canvas/html2canvas）
├── 文章正文（Markdown 渲染）
├── 向本文提问（问答输入框 + 对话列表）
├── [下载原文] 按钮 → 未登录则弹出登录框
└── 文献引用信息

/admin              管理后台
├── 文章列表 + 状态管理
├── PDF 批量上传区
└── 文章预览 / 编辑

/login              登录页
└── 微信扫码登录
```

### 明白卡分享功能

用户点击"分享明白卡"时，前端通过 html2canvas 将明白卡区域渲染为图片：

- 品牌绿色背景 + 要点列表 + 网站域名
- 支持下载图片到本地
- 支持复制到剪贴板（直接粘贴到微信）
- 明白卡的视觉设计参照 Figma 设计稿（"沼液还田-design-c"）

### 技术选型

- Next.js 15（SSG 导出，Nginx 托管静态文件）
- Tailwind CSS（样式）
- Tanstack Query（API 数据请求）
- Zustand（登录态状态管理）
- react-markdown + remark-gfm（Markdown 渲染）
- html2canvas（明白卡图片生成）

---

## 部署方案

### 服务器环境

阿里云轻量应用服务器（1-2核 2GB 内存），Ubuntu/Debian 系统。

### 服务部署

```
/etc/systemd/system/biogas-api.service    FastAPI + arq worker
/etc/systemd/system/biogas-frontend.service  Next.js server (ISR 支持)
/var/lib/biogas/                           SQLite 数据库文件
/etc/nginx/sites-available/biogas          Nginx 配置
```

Next.js 以 server 模式运行（非 SSG 导出），支持 ISR（增量静态再生成）：文章页面在首次访问时静态生成并缓存，后续请求直接返回缓存，内容更新后自动重新生成。无需每次发布文章都重新 build。

### Nginx 配置

```nginx
server {
    listen 80;
    server_name biogas.bio-spring.top;

    # Next.js 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### HTTPS

使用 Let's Encrypt + Certbot 配置 SSL 证书。

---

## 项目结构

```
biogas-flyer/
├── backend/
│   ├── src/
│   │   └── biogas/
│   │       ├── main.py          FastAPI 应用入口
│   │       ├── config.py        配置管理
│   │       ├── database.py      SQLite + sqlite-vec 连接
│   │       ├── models/          SQLAlchemy 模型
│   │       ├── schemas/         Pydantic 数据模式
│   │       ├── api/             路由
│   │       │   ├── auth.py      认证
│   │       │   ├── articles.py  文章
│   │       │   ├── papers.py    PDF 上传/下载
│   │       │   ├── qa.py        问答
│   │       │   └── admin.py     管理后台
│   │       ├── services/        业务逻辑
│   │       │   ├── ai_pipeline.py    AI 解读管线
│   │       │   ├── pdf_parser.py     MinerU PDF 解析
│   │       │   ├── wechat.py          微信登录服务
│   │       │   ├── oss.py            OSS 文件存储
│   │       │   └── qa_engine.py      问答引擎
│   │       └── tasks/
│   │           └── process_paper.py  arq 异步任务
│   ├── alembic/                 数据库迁移
│   ├── pyproject.toml
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── app/                 Next.js App Router
│   │   │   ├── page.tsx         首页
│   │   │   ├── posts/[slug]/    文章页
│   │   │   ├── admin/           管理后台
│   │   │   └── login/           登录页
│   │   ├── components/          组件
│   │   │   ├── UnderstandingCard.tsx  明白卡
│   │   │   ├── ShareCardButton.tsx    分享按钮
│   │   │   ├── QAPanel.tsx            问答面板
│   │   │   ├── LoginDialog.tsx        登录弹窗
│   │   │   └── PaperUpload.tsx        PDF 上传
│   │   ├── lib/                 工具函数
│   │   └── stores/              Zustand 状态
│   ├── package.json
│   └── next.config.js
├── docs/
├── scripts/                     部署脚本
├── .env.example                 环境变量模板
└── README.md
```

---

## 环境变量

```bash
# 数据库
DATABASE_URL=sqlite+aiosqlite:///./data/biogas.db

# AI
DASHSCOPE_API_KEY=sk-xxx
DASHSCOPE_MODEL=qwen-plus

# MinerU (本地部署)
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

---

## 已有内容迁移

现有 Hugo 站点的第一篇文章（`content/posts/2024-06-rice-slurry/index.md`）需要迁移到新系统：

1. 手动提取其结构化字段（沼液类型、作物、用量等）写入 articles 表
2. 文章正文 Markdown 保存到 `content_md`
3. 明白卡要点从 `understanding` frontmatter 提取
4. PDF 原文需另行获取并上传至 OSS
