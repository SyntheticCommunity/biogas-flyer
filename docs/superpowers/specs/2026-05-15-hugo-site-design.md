# 沼液还田科普网站设计文档

## 项目概述

基于 Hugo 搭建的沼液还田科普宣传静态网站，为农民和农技员提供科学、易懂的沼液还田指导材料。网站采用"明白卡 + 完整文章"双层结构，兼顾传播性和专业性。

**域名**：`gas.bio-spring.top`
**部署**：GitHub Pages（备份） → webhook → 阿里云服务器（国内服务）

---

## 1. 视觉风格

### 配色方案

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色（深绿） | 墨绿 | `#0d3b2e` |
| 主色（亮绿） | 翡翠绿 | `#10b981` |
| 背景色 | 白色 | `#ffffff` |
| 卡片/区块背景 | 浅灰绿 | `#f8faf9` |
| 高亮/警告 | 琥珀金 | `#f59e0b` |
| 正文文字 | 深灰 | `#374151` |
| 次要文字 | 中灰 | `#6b7280` |

### 字体

- **标题**：系统黑体栈（`-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`）
- **正文**：系统无衬线字体栈，行高 1.8，字号 16px 基准
- **纯中文**，不考虑英文排版优化

### 整体感觉

专业、可信、现代，同时保持农业亲和力。避免过于花哨的装饰，以内容为核心。

---

## 2. 页面结构

### 2.1 首页 `index.html`

**布局**：Hero + 置顶推荐 + 文章列表

- **Hero Banner**：全宽渐变背景（深墨绿 → 翡翠绿），显示站名"沼液还田科普站"和 slogan"科学种田 · 绿色循环 · 乡村振兴"
- **置顶文章**：最新或标记为 `featured: true` 的文章，带绿色边框突出显示
- **文章列表**：按时间倒序排列，每条显示图标、标题、日期、分类

### 2.2 科普文章页 `posts/{YYYY-MM-slug}/`

**布局**：单栏阅读 + 浮动目录球

- **文章头部**：标题、副标题、作者、发布日期、分类标签，渐变绿色背景
- **明白卡**：嵌在文章顶部的绿色卡片（`#ecfdf5` 背景），显示核心要点（作物、用量、时机等）
- **正文区**：单栏，最大宽度 720px，居中显示
- **浮动目录球**：桌面端右侧悬浮小球，点击展开章节导航，滚动时始终可见；手机端隐藏
- **FAQ 折叠区**：使用 HTML `<details>` 实现问答折叠
- **底部引用**：灰色背景区块，显示原始文献出处和团队信息

### 2.3 关于我们 `about/`

- 团队介绍（华中农业大学土壤健康与绿色农业团队）
- 项目背景和目标
- 联系方式

### 2.4 实用工具 `tools/`

- **沼液用量计算器**：输入种植面积，自动计算所需沼液吨数
- **安全检测标准速查表**：重金属限量标准对照表

---

## 3. 内容组织

### Hugo 目录结构

```
biogas-flyer/
├── content/
│   ├── posts/              # 科普文章
│   │   ├── 2024-06-rice-slurry/
│   │   │   ├── index.md
│   │   │   ├── tu2.png
│   │   │   └── tu3.png
│   │   └── 2024-08-veggie-slurry/
│   │       └── index.md
│   ├── about.md            # 关于我们
│   └── tools.md            # 实用工具
├── static/
│   └── images/             # 全站通用图片（logo 等）
├── themes/
│   └── biogas-theme/       # 自定义主题
├── layouts/                # 主题覆盖层
├── archetypes/
│   └── posts.md            # 文章模板
├── hugo.toml               # 站点配置
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions 部署
```

### 文章文件夹命名规则

```
YYYY-MM-slug/
```

- **YYYY-MM**：文章发布日期，保证时间排序
- **slug**：英文短横线连接，简短有意义，URL 友好
- **slug 生成**：由 Skill 从 PDF 提取内容后自动生成

示例：
```
2024-06-rice-slurry/       # 猪粪沼液还田：水稻增产提质实战指南
2024-08-veggie-slurry/     # 沼液还田：蔬菜种植应用指南
2025-01-soil-testing/      # 沼液安全检测标准
```

### 文章 Frontmatter 格式

```yaml
---
title: "猪粪沼液还田：水稻增产提质实战指南"
subtitle: "打通种养循环，让化肥钱留在自己口袋里"
date: 2024-06-15
author: "华中农业大学土壤健康与绿色农业团队"
categories: ["水稻", "土壤改良"]
tags: ["沼液还田", "增产", "田间试验"]
featured: true
source: "植物营养与肥料学报 2023, 29(3): 483-495"
---
```

---

## 4. 内容更新流程

```
PDF 文献 → Skill 自动提取 → Markdown + 图片 → content/posts/{YYYY-MM-slug}/ → Git push → 自动部署
```

Skill 职责：
1. 从 PDF 中提取沼液还田关键信息
2. 提取文章中的图片
3. 生成明白卡要点（结构化数据）
4. 生成完整 Markdown 文章（含图片引用）
5. 输出到 `content/posts/{YYYY-MM-slug}/index.md`

---

## 5. 部署架构

```
GitHub repo (main branch)
    ↓ push
GitHub Actions → Hugo build → GitHub Pages (https://<user>.github.io/biogas-flyer/)
    ↓ webhook
阿里云服务器 → Nginx → gas.bio-spring.top（国内用户）
```

---

## 6. Hugo 主题选择

推荐基于 **Blowfish** 或 **PaperMod** 主题进行定制：
- 两者都支持博客式文章布局
- 移动端适配良好
- 支持目录生成、暗色模式（可选）
- Hugo 生态活跃，文档完善

定制要点：
- 覆盖配色 CSS 为项目指定的绿色系
- 修改 Hero Banner 组件
- 添加明白卡组件
- 添加浮动目录球组件
- 添加工具页面（计算器用 JavaScript 实现）

---

## 7. 技术约束

- Hugo Extended 版本（支持 SCSS）
- GitHub Actions 部署（免费）
- 纯静态，无后端
- 工具页面的计算器用前端 JavaScript 实现
- 图片优化：Hugo 的 `resources.PostProcess` 或构建时压缩

---

## 8. 现有内容迁移

将 `code/index.qmd` 中的内容迁移到 Hugo 格式：
- 保留所有文字、表格、FAQ 内容
- Quarto callout → Hugo shortcode 或自定义 CSS
- 图片 `tu2.png`、`tu3.png` 放入文章文件夹
- HTML `<details>` 保留为原生 HTML
