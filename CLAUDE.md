@AGENTS.md

# 沼液还田科普平台 (biogas.bio-spring.top)

面向农户和农技人员的沼液还田科研成果科普网站。纯展示站点，提供文章阅读和文献下载（登录后可下载原文 PDF）。

管理功能（文献上传、PDF 解析、LLM 解读）已迁移至 `app.bio-spring.top` 的"还田科普"模块。

## 技术栈

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Tanstack Query（API 数据请求）
- Zustand（登录态状态管理）
- react-markdown + remark-gfm（Markdown 渲染）
- html2canvas（明白卡图片生成）

## 目录结构

```
src/
├── app/
│   ├── page.tsx              首页（文章列表）
│   ├── posts/[slug]/page.tsx 文章详情页（含 PDF 下载）
│   ├── login/page.tsx        手机号注册/登录
│   ├── about/page.tsx        关于页面
│   ├── layout.tsx            根布局
│   └── providers.tsx         React Query Provider
├── components/
│   ├── Header.tsx            导航栏（登录/注销）
│   ├── HeroBanner.tsx        首页 Hero 区域
│   ├── ArticleCard.tsx       文章卡片
│   ├── UnderstandingCard.tsx 明白卡要点
│   ├── LoginDialog.tsx       登录弹窗（含手机号注册）
│   └── Footer.tsx            页脚
├── lib/
│   └── api.ts                API 请求工具（自动带 JWT）
└── stores/
    └── auth.ts               Zustand 登录状态
```

## API 对接

后端部署在 `api.bio-spring.top`，前端通过 `NEXT_PUBLIC_API_URL` 环境变量配置（默认 `https://api.bio-spring.top/api/v1`）。

主要 API 端点：
- `GET /articles` — 文章列表（公开，支持 crop 过滤）
- `GET /articles/{slug}` — 文章详情（公开）
- `GET /papers/{paper_id}/download` — 获取 PDF 签名 URL（需登录）
- `POST /auth/register` — 手机号注册
- `POST /auth/login` — 手机号+密码登录
- `GET /auth/me` — 当前用户信息

## 设计规范

设计稿在 `design/biogas-website.pen`，包含移动端（390px）和桌面端（1200px）共 6 个页面。

**色彩体系（CSS 变量，见 `globals.css`）：**
- 主色 `#1E3A5F`（靛蓝）/ 亮色 `#2E5A8F`
- 点缀 `#C4880C`（暖金）
- 背景 `#FAF8F5`（暖白）/ 前景 `#1A1A1A`
- 边框 `#E5E1DB`

**深色模式：** 通过 `@media (prefers-color-scheme: dark)` 自动切换（Tailwind v4 默认），无需手动 toggle。所有组件需同时提供 `dark:` 变体类。暗色背景 `#111827`，卡片 `dark:bg-gray-800`，边框 `dark:border-gray-700`。

**响应式断点：**
- 移动端 `< 768px`：单栏布局
- 桌面端 `≥ 768px`：三栏网格，居中 max-width (960px)

## 部署

自有服务器（阿里云轻量应用 2GB），systemd 服务 `biogas-frontend.service`（端口 3003），Nginx 反向代理。

**部署方式：** push 到 `master` 分支后通过 webhook.bio-spring.top 自动部署，不要手动 SSH 部署。

**注意：** 服务器无法通过 HTTPS（port 443）连接 GitHub，git remote 必须使用 SSH 协议（`git@github.com:SyntheticCommunity/biogas-flyer.git`）。部署脚本已包含 `git remote set-url` 确保协议正确。

## 测试环境

本地无数据库访问权限，功能测试必须部署到服务器进行。

- 前端部署到 `biogas.bio-spring.top`（自有服务器）
- API 测试通过 `https://api.bio-spring.top/api/v1` 进行
- `.env.local` 默认指向生产 API：`NEXT_PUBLIC_API_URL=https://api.bio-spring.top/api/v1`
- 验证流程：本地 `npm run build` → 部署到服务器 → 访问 `biogas.bio-spring.top` 测试

## 惯例

- 优先 Server Components，减少 `"use client"` 使用
- 新增 API 调用统一走 `src/lib/api.ts`
- 文章内容通过 React Markdown + Tailwind Typography 渲染
