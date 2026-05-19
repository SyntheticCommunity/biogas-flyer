# 沼液还田科普站

> [biogas.bio-spring.top](https://biogas.bio-spring.top)

让科研成果走进田间地头。

## 关于

沼液还田科普平台是面向农户和农技人员的科研成果传播系统。管理员批量上传学术论文 PDF，AI 自动生成结构化科普文章和「明白卡要点」，用户可阅读文章、下载原文、就文章内容提问。

由**华中农业大学土壤健康与绿色农业团队**创建，**湖北长投双新环保科技有限公司**提供技术支持。

## 主要功能

- **科普文章** — AI 生成的结构化科普内容，含明白卡要点
- **论文下载** — 微信扫码登录后可下载 PDF 原文
- **智能问答** — 基于文章内容的 RAG 问答
- **管理后台** — 批量上传 PDF，自动生成文章

## 技术栈

| 层面 | 技术 |
|---|---|
| 前端 | Next.js 16, React 19, Tailwind CSS 4 |
| 状态管理 | Tanstack Query, Zustand |
| Markdown | react-markdown, remark-gfm |
| 图片生成 | html2canvas |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 3000）
npm run dev
```

在 `.env.local` 中配置 API 地址：

```bash
# 本地开发
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# 生产环境
NEXT_PUBLIC_API_URL=https://api.bio-spring.top/api/v1
```

## 项目结构

```
src/
├── app/              Next.js App Router 页面
├── components/       UI 组件
├── lib/              工具函数（API 请求）
└── stores/           Zustand 状态管理
design/               Pencil 设计稿
```

## 部署

部署在自有服务器（阿里云轻量应用 2GB），通过 systemd 服务 `biogas-frontend.service` 运行，Nginx 反向代理。
