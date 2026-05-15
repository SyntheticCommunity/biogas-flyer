# 沼液还田科普网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Hugo static site for biogas slurry science communication, deployed to GitHub Pages and mirrored to Alibaba Cloud.

**Architecture:** Hugo with PaperMod theme, customized with green color scheme, hero banner, understanding card, floating TOC, and tools page. Content organized in `content/posts/YYYY-MM-slug/` folders. GitHub Actions auto-deploys on push.

**Tech Stack:** Hugo Extended, PaperMod theme, HTML/CSS/JavaScript, GitHub Actions

---

## File Structure

```
biogas-flyer/
├── hugo.toml                          # Site configuration
├── go.mod                             # Hugo module (auto-generated)
├── go.sum                             # Hugo module checksum (auto-generated)
├── content/
│   ├── posts/
│   │   └── 2024-06-rice-slurry/
│   │       ├── index.md               # First article (migrated)
│   │       ├── tu2.png                # Article image
│   │       └── tu3.png                # Article image
│   ├── about.md                       # About page
│   └── tools.md                       # Tools page
├── static/
│   └── images/
│       └── logo.svg                   # Site logo (optional)
├── layouts/
│   ├── _default/
│   │   ├── baseof.html                # Base template override
│   │   ├── single.html                # Article page
│   │   └── list.html                  # List/archive page
│   ├── index.html                     # Homepage
│   ├── partials/
│   │   ├── hero.html                  # Hero banner
│   │   ├── understanding-card.html    # 明白卡 component
│   │   └── floating-toc.html          # Floating TOC ball
│   └── shortcodes/
│       └── callout.html               # Callout box shortcode
├── assets/
│   └── css/
│       └── custom.css                 # Custom styles
├── archetypes/
│   └── posts.md                       # Post template
├── themes/
│   └── PaperMod/                      # Theme (git submodule)
└── .github/
    └── workflows/
        └── deploy.yml                 # GitHub Actions
```

---

### Task 1: Initialize Hugo Project and Add PaperMod Theme

**Files:**
- Create: `hugo.toml`, `go.mod`
- Create: `themes/PaperMod/` (git submodule)

- [ ] **Step 1: Initialize Hugo site in project root**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo new site . --force
```

This creates `hugo.toml`, `go.mod`, and the directory structure. The `--force` flag allows initializing in a non-empty directory (existing `code/` folder is preserved).

- [ ] **Step 2: Add PaperMod theme as git submodule**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

- [ ] **Step 3: Verify theme files exist**

Run:
```bash
ls themes/PaperMod/layouts/_default/
```

Expected: `baseof.html`, `single.html`, `list.html`, `terms.html`

- [ ] **Step 4: Create directory structure for custom layouts and assets**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
mkdir -p layouts/partials layouts/shortcodes layouts/_default assets/css static/images archetypes
```

- [ ] **Step 5: Commit**

```bash
git add hugo.toml go.mod go.sum themes/PaperMod
git commit -m "init: Hugo project with PaperMod theme"
```

---

### Task 2: Configure hugo.toml

**Files:**
- Modify: `hugo.toml`

- [ ] **Step 1: Write site configuration**

```toml
baseURL = "https://gas.bio-spring.top/"
languageCode = "zh-cn"
defaultContentLanguage = "zh"
title = "沼液还田科普站"
theme = "PaperMod"
paginate = 10

[params]
  env = "production"
  description = "科学种田 · 绿色循环 · 乡村振兴"
  author = "华中农业大学土壤健康与绿色农业团队"
  defaultTheme = "auto"
  ShowShareButtons = false
  ShowReadingTime = true
  ShowPostNavLinks = true
  ShowBreadCrumbs = true
  ShowCodeCopyButtons = true
  ShowToc = true
  TocOpen = false
  comments = false

  [params.homeInfoParams]
    Title = "沼液还田科普站"
    Content = "科学种田 · 绿色循环 · 乡村振兴"

  [[params.socialIcons]]
    name = "github"
    url = "https://github.com/SyntheticCommunity"

[menu]
  [[menu.main]]
    identifier = "posts"
    name = "科普文章"
    url = "/posts/"
    weight = 10
  [[menu.main]]
    identifier = "tools"
    name = "实用工具"
    url = "/tools/"
    weight = 20
  [[menu.main]]
    identifier = "about"
    name = "关于我们"
    url = "/about/"
    weight = 30

[outputs]
  home = ["HTML", "RSS", "JSON"]

[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
  [markup.highlight]
    style = "monokai"
    lineNos = false

[taxonomies]
  category = "categories"
  tag = "tags"

[module]
  [[module.imports]]
    path = "github.com/adityatelange/hugo-PaperMod"
```

- [ ] **Step 2: Verify Hugo builds without errors**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo --gc --minify 2>&1
```

Expected: Build completes with no errors. Output shows "Start building sites..." and "Built in XXX ms".

- [ ] **Step 3: Commit**

```bash
git add hugo.toml
git commit -m "config: site configuration with PaperMod settings"
```

---

### Task 3: Create Custom Base Template

**Files:**
- Create: `layouts/_default/baseof.html`

- [ ] **Step 1: Write base template**

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ if not .IsHome }}{{ .Title }} | {{ end }}{{ .Site.Title }}</title>
    {{ $style := resources.Get "css/custom.css" | minify }}
    <link rel="stylesheet" href="{{ $style.RelPermalink }}">
    {{ block "head" . }}{{ end }}
</head>
<body>
    {{ partial "header.html" . }}
    <main class="site-main">
        {{ block "main" . }}{{ end }}
    </main>
    {{ partial "footer.html" . }}
    {{ block "scripts" . }}{{ end }}
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add layouts/_default/baseof.html
git commit -m "layout: base template with custom CSS hook"
```

---

### Task 4: Create Homepage Layout

**Files:**
- Create: `layouts/index.html`

- [ ] **Step 1: Write homepage template**

```html
{{ define "main" }}
<div class="home-container">
    {{ partial "hero.html" . }}

    <div class="content-wrapper">
        {{/* Featured post */}}
        {{ $featured := where .Site.RegularPages "Params.featured" true }}
        {{ if $featured }}
        <section class="featured-section">
            <h2 class="section-title">📌 最新发布</h2>
            {{ range first 1 $featured }}
            <a href="{{ .RelPermalink }}" class="featured-card">
                <div class="featured-badge">推荐阅读</div>
                <h3 class="featured-title">{{ .Title }}</h3>
                {{ with .Params.subtitle }}
                <p class="featured-subtitle">{{ . }}</p>
                {{ end }}
                <div class="featured-meta">
                    <span>{{ .Date.Format "2006-01-02" }}</span>
                    {{ with .Params.categories }}
                    <span>{{ index . 0 }}</span>
                    {{ end }}
                </div>
            </a>
            {{ end }}
        </section>
        {{ end }}

        {{/* All posts list */}}
        <section class="posts-section">
            <h2 class="section-title">📚 科普文章</h2>
            {{ range .Site.RegularPages }}
            <a href="{{ .RelPermalink }}" class="post-item">
                <div class="post-icon">📄</div>
                <div class="post-info">
                    <h3 class="post-title">{{ .Title }}</h3>
                    <div class="post-meta">
                        <span>{{ .Date.Format "2006-01-02" }}</span>
                        {{ with .Params.categories }}
                        <span>{{ index . 0 }}</span>
                        {{ end }}
                    </div>
                </div>
                <div class="post-arrow">→</div>
            </a>
            {{ end }}
        </section>
    </div>
</div>
{{ end }}
```

- [ ] **Step 2: Create sample content for testing**

Create `content/_index.md`:
```markdown
---
title: "首页"
---
```

Create `content/posts/2024-06-rice-slurry/_index.md`:
```markdown
---
title: "猪粪沼液还田：水稻增产提质实战指南"
subtitle: "打通种养循环，让化肥钱留在自己口袋里"
date: 2024-06-15
author: "华中农业大学土壤健康与绿色农业团队"
categories: ["水稻"]
tags: ["沼液还田", "增产"]
featured: true
---
Test content.
```

- [ ] **Step 3: Test homepage renders**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo server -D
```

Open `http://localhost:1313` in browser. Verify:
- Hero banner displays with green gradient
- Featured post card shows
- Post list shows

Press `Ctrl+C` to stop server.

- [ ] **Step 4: Commit**

```bash
git add layouts/index.html content/_index.md content/posts/
git commit -m "layout: homepage with hero, featured post, and post list"
```

---

### Task 5: Create Article Page Layout

**Files:**
- Create: `layouts/_default/single.html`
- Create: `layouts/partials/understanding-card.html`
- Create: `layouts/partials/floating-toc.html`

- [ ] **Step 1: Write article page template**

```html
{{ define "main" }}
<article class="article-container">
    {{/* Article header */}}
    <header class="article-header">
        <div class="article-meta-top">
            {{ with .Params.categories }}
            <span class="article-category">{{ index . 0 }}</span>
            {{ end }}
            <span class="article-date">{{ .Date.Format "2006-01-02" }}</span>
        </div>
        <h1 class="article-title">{{ .Title }}</h1>
        {{ with .Params.subtitle }}
        <p class="article-subtitle">{{ . }}</p>
        {{ end }}
        {{ with .Params.author }}
        <p class="article-author">{{ . }}</p>
        {{ end }}
    </header>

    {{/* Understanding card */}}
    {{ partial "understanding-card.html" . }}

    {{/* Article content */}}
    <div class="article-content">
        {{ .Content }}
    </div>

    {{/* Source citation */}}
    {{ with .Params.source }}
    <footer class="article-source">
        <p><strong>原始文献：</strong>{{ . }}</p>
        <p><strong>制作团队：</strong>{{ $.Params.author | default "华中农业大学土壤健康与绿色农业团队" }}</p>
    </footer>
    {{ end }}
</article>

{{/* Floating TOC */}}
{{ partial "floating-toc.html" . }}
{{ end }}
```

- [ ] **Step 2: Write understanding card partial**

Create `layouts/partials/understanding-card.html`:
```html
{{ with .Params.understanding }}
<div class="understanding-card">
    <div class="understanding-title">📌 明白卡要点</div>
    <ul class="understanding-list">
        {{ range . }}
        <li>✅ {{ . }}</li>
        {{ end }}
    </ul>
</div>
{{ end }}
```

- [ ] **Step 3: Write floating TOC partial**

Create `layouts/partials/floating-toc.html`:
```html
{{ if .Params.Toc }}
<div class="floating-toc" id="floating-toc">
    <div class="toc-toggle" onclick="document.getElementById('floating-toc').classList.toggle('toc-expanded')">
        📋
    </div>
    <div class="toc-content">
        <div class="toc-title">目录</div>
        {{ .TableOfContents }}
    </div>
</div>
{{ end }}
```

- [ ] **Step 4: Update test article with understanding card data**

Update `content/posts/2024-06-rice-slurry/_index.md`:
```markdown
---
title: "猪粪沼液还田：水稻增产提质实战指南"
subtitle: "打通种养循环，让化肥钱留在自己口袋里"
date: 2024-06-15
author: "华中农业大学土壤健康与绿色农业团队"
categories: ["水稻"]
tags: ["沼液还田", "增产"]
featured: true
Toc: true
understanding:
  - "适用作物：水稻"
  - "施用次数：每季 2 次"
  - "单次用量：20 吨/亩"
  - "施用时机：6月插秧期 + 9月抽穗期"
---

## 核心试验数据

口说无凭，我们直接看连续3年记录的真实对比数据。

### 产量与大米品质对比

| 施肥方式 | 水稻产量 (kg/hm²) | 蛋白质含量 (g/kg) |
| :--- | :---: | :---: |
| **全用化肥 (对照组)** | 7800 | 58.67 |
| **施用沼液 3年** | **9823** | **73.31** |

> 💡 **结论：** 连续施用3年沼液，比全用化肥增产显著！

## 常见问题

<details>
<summary><strong>🔴 问题一：地会不会越泼越酸？</strong></summary>
<p>别慌，第三年 pH 值完全恢复正常（5.83）。</p>
</details>
```

- [ ] **Step 5: Test article page renders**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo server -D
```

Open `http://localhost:1313/posts/2024-06-rice-slurry/`. Verify:
- Article header with title and meta
- Understanding card displays with green background
- Table renders correctly
- FAQ details/summary works
- Floating TOC appears on right side (desktop)

- [ ] **Step 6: Commit**

```bash
git add layouts/_default/single.html layouts/partials/understanding-card.html layouts/partials/floating-toc.html content/posts/
git commit -m "layout: article page with understanding card and floating TOC"
```

---

### Task 6: Custom CSS — Colors, Typography, Components

**Files:**
- Create: `assets/css/custom.css`

- [ ] **Step 1: Write custom CSS**

```css
/* ===== Color Variables ===== */
:root {
    --color-primary: #0d3b2e;
    --color-primary-light: #10b981;
    --color-accent: #f59e0b;
    --color-bg: #ffffff;
    --color-bg-light: #f8faf9;
    --color-text: #374151;
    --color-text-muted: #6b7280;
    --color-understanding-bg: #ecfdf5;
    --color-understanding-border: #10b981;
}

/* ===== Hero Banner ===== */
.hero-banner {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    padding: 60px 20px;
    text-align: center;
}
.hero-title {
    font-size: 2.5em;
    font-weight: 700;
    margin: 0;
}
.hero-subtitle {
    font-size: 1.1em;
    opacity: 0.9;
    margin-top: 8px;
}

/* ===== Content Wrapper ===== */
.content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 30px 20px;
}

/* ===== Featured Card ===== */
.featured-card {
    display: block;
    background: var(--color-bg);
    border: 2px solid var(--color-primary-light);
    border-radius: 12px;
    padding: 24px;
    margin: 16px 0;
    text-decoration: none;
    color: inherit;
    transition: box-shadow 0.2s;
}
.featured-card:hover {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}
.featured-badge {
    display: inline-block;
    background: var(--color-primary-light);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    margin-bottom: 12px;
}
.featured-title {
    font-size: 1.4em;
    margin: 0 0 8px;
    color: var(--color-primary);
}
.featured-subtitle {
    color: var(--color-text-muted);
    margin: 0 0 12px;
}
.featured-meta {
    font-size: 0.9em;
    color: var(--color-text-muted);
}
.featured-meta span + span::before {
    content: " · ";
}

/* ===== Post List ===== */
.section-title {
    font-size: 1.2em;
    color: var(--color-primary);
    margin: 30px 0 16px;
}
.post-item {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--color-bg);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 10px;
    text-decoration: none;
    color: inherit;
    border: 1px solid #e5e7eb;
    transition: border-color 0.2s;
}
.post-item:hover {
    border-color: var(--color-primary-light);
}
.post-icon {
    width: 48px;
    height: 48px;
    background: var(--color-understanding-bg);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4em;
    flex-shrink: 0;
}
.post-info {
    flex: 1;
}
.post-title {
    font-size: 1.05em;
    margin: 0;
    color: var(--color-text);
}
.post-meta {
    font-size: 0.85em;
    color: var(--color-text-muted);
    margin-top: 4px;
}
.post-meta span + span::before {
    content: " · ";
}
.post-arrow {
    color: var(--color-primary-light);
    font-size: 1.2em;
}

/* ===== Article Header ===== */
.article-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    padding: 40px 20px;
    text-align: center;
}
.article-meta-top {
    font-size: 0.9em;
    opacity: 0.8;
    margin-bottom: 8px;
}
.article-category {
    background: rgba(255,255,255,0.2);
    padding: 2px 10px;
    border-radius: 12px;
}
.article-title {
    font-size: 1.8em;
    margin: 0;
}
.article-subtitle {
    font-size: 1.05em;
    opacity: 0.9;
    margin-top: 8px;
}
.article-author {
    font-size: 0.9em;
    opacity: 0.7;
    margin-top: 12px;
}

/* ===== Article Content ===== */
.article-container {
    max-width: 720px;
    margin: 0 auto;
}
.article-content {
    padding: 30px 20px;
    line-height: 1.8;
    font-size: 16px;
    color: var(--color-text);
}
.article-content h2 {
    color: var(--color-primary);
    border-bottom: 2px solid var(--color-primary-light);
    padding-bottom: 8px;
    margin-top: 36px;
}
.article-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}
.article-content th {
    background: var(--color-primary);
    color: white;
    padding: 10px 14px;
    text-align: left;
}
.article-content td {
    padding: 10px 14px;
    border-bottom: 1px solid #e5e7eb;
}
.article-content tr:nth-child(even) {
    background: var(--color-bg-light);
}
.article-content blockquote {
    background: #fffbeb;
    border-left: 4px solid var(--color-accent);
    padding: 14px 18px;
    border-radius: 0 8px 8px 0;
    margin: 20px 0;
}
.article-content details {
    background: var(--color-bg-light);
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
    border: 1px solid #e5e7eb;
}
.article-content details summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--color-primary);
}

/* ===== Understanding Card ===== */
.understanding-card {
    background: var(--color-understanding-bg);
    border: 1px solid var(--color-understanding-border);
    border-radius: 12px;
    padding: 20px;
    margin: 24px 20px;
}
.understanding-title {
    font-weight: 700;
    color: var(--color-primary);
    font-size: 1.05em;
    margin-bottom: 10px;
}
.understanding-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.understanding-list li {
    padding: 4px 0;
    color: var(--color-text);
}

/* ===== Floating TOC ===== */
.floating-toc {
    position: fixed;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
}
.toc-toggle {
    width: 44px;
    height: 44px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2em;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.2s;
}
.toc-toggle:hover {
    transform: scale(1.1);
}
.toc-content {
    display: none;
    position: absolute;
    right: 0;
    top: 52px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px;
    width: 220px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.toc-expanded .toc-content {
    display: block;
}
.toc-title {
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 8px;
    font-size: 0.9em;
}
.toc-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.toc-content li {
    padding: 3px 0;
}
.toc-content a {
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 0.85em;
}
.toc-content a:hover {
    color: var(--color-primary-light);
}

/* ===== Article Source Footer ===== */
.article-source {
    background: var(--color-bg-light);
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    margin: 20px;
    font-size: 0.9em;
    color: var(--color-text-muted);
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
    .hero-title { font-size: 1.8em; }
    .hero-banner { padding: 40px 16px; }
    .article-title { font-size: 1.4em; }
    .floating-toc { display: none; }
    .content-wrapper { padding: 20px 16px; }
}
```

- [ ] **Step 2: Test styling renders correctly**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo server -D
```

Verify in browser:
- Green gradient hero banner
- Green bordered featured card
- Understanding card with green background
- Table with green header
- Floating TOC ball on right side (desktop)
- Mobile: floating TOC hidden, responsive font sizes

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "style: custom CSS with green theme, components, responsive design"
```

---

### Task 7: Create About Page

**Files:**
- Create: `content/about.md`

- [ ] **Step 1: Write about page content**

```markdown
---
title: "关于我们"
description: "华中农业大学土壤健康与绿色农业团队"
layout: "single"
---

## 团队介绍

华中农业大学土壤健康与绿色农业团队，致力于土壤健康维护与农业可持续发展的研究与推广工作。

## 项目背景

沼液还田科普站旨在将科研成果转化为通俗易懂的农业指导材料，帮助农民和基层农技员科学使用沼液，实现种养循环、减肥增效的目标。

## 联系我们

- **单位**：华中农业大学
- **团队**：土壤健康与绿色农业团队
```

- [ ] **Step 2: Test about page renders**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo server -D
```

Open `http://localhost:1313/about/`. Verify page renders with article layout.

- [ ] **Step 3: Commit**

```bash
git add content/about.md
git commit -m "content: about page"
```

---

### Task 8: Create Tools Page

**Files:**
- Create: `content/tools.md`

- [ ] **Step 1: Write tools page with calculator**

```markdown
---
title: "实用工具"
description: "沼液还田实用计算工具"
layout: "single"
---

## 沼液用量计算器

输入您的种植面积，自动计算所需沼液量。

<div id="calculator" style="background: #f8faf9; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb;">
  <div style="margin-bottom: 16px;">
    <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #0d3b2e;">种植面积（亩）</label>
    <input type="number" id="area" placeholder="请输入面积" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
  </div>
  <div style="margin-bottom: 16px;">
    <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #0d3b2e;">施用次数（每季）</label>
    <select id="times" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
      <option value="2" selected>2 次（推荐）</option>
      <option value="3">3 次</option>
    </select>
  </div>
  <button onclick="calculate()" style="width: 100%; background: #0d3b2e; color: white; padding: 12px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600;">计算</button>
  <div id="result" style="margin-top: 16px; display: none; background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px;">
  </div>
</div>

<script>
function calculate() {
    const area = parseFloat(document.getElementById('area').value);
    const times = parseInt(document.getElementById('times').value);
    if (!area || area <= 0) {
        alert('请输入有效的种植面积');
        return;
    }
    const perTime = area * 20;
    const total = perTime * times;
    const nitrogen = area * 8 * times;
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').innerHTML = `
        <div style="font-weight: 700; color: #0d3b2e; font-size: 1.1em; margin-bottom: 8px;">📊 计算结果</div>
        <div style="color: #374151; line-height: 1.8;">
            <div>▸ 单次用量：<strong>${perTime} 吨</strong>（每亩 20 吨 × ${area} 亩）</div>
            <div>▸ 全季总用量：<strong>${total} 吨</strong>（${perTime} 吨 × ${times} 次）</div>
            <div>▸ 全季纯氮投入：<strong>${nitrogen} 公斤</strong>（每亩每次约 8 公斤）</div>
        </div>
        <div style="margin-top: 10px; font-size: 0.85em; color: #6b7280;">
            ⚠️ 以上为理论计算值，实际用量请结合土壤状况和作物长势调整。
        </div>
    `;
}
</script>

## 沼液安全检测标准速查表

沼液施用前必须检测以下指标，确保符合国家安全标准：

| 检测项目 | 安全限值 | 说明 |
| :--- | :---: | :--- |
| 铅 (Pb) | ≤ 0.3 mg/L | 重金属，影响作物品质 |
| 镉 (Cd) | ≤ 0.01 mg/L | 高毒性重金属 |
| 铬 (Cr) | ≤ 1.0 mg/L | 六价铬毒性更强 |
| 砷 (As) | ≤ 0.1 mg/L | 剧毒，必须严格把控 |
| 汞 (Hg) | ≤ 0.001 mg/L | 极微量即有害 |
| pH | 6.5 - 8.5 | 过酸过碱均不利 |
| 蛔虫卵 | ≤ 0.01 个/L | 病原菌指标 |

> ⚠️ **提醒：** 务必使用规范化养殖场经过充分厌氧发酵的沼液，使用前建议送检。
```

- [ ] **Step 2: Test tools page renders**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo server -D
```

Open `http://localhost:1313/tools/`. Verify:
- Calculator input fields display
- Click "计算" button with a value → result shows
- Standards table renders
- Mobile layout works

- [ ] **Step 3: Commit**

```bash
git add content/tools.md
git commit -m "content: tools page with calculator and standards table"
```

---

### Task 9: Migrate Existing Content

**Files:**
- Modify: `content/posts/2024-06-rice-slurry/index.md`
- Copy: `code/tu2.png` → `content/posts/2024-06-rice-slurry/tu2.png`
- Copy: `code/tu3.png` → `content/posts/2024-06-rice-slurry/tu3.png`

- [ ] **Step 1: Copy images from existing content**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
cp code/tu2.png content/posts/2024-06-rice-slurry/tu2.png
cp code/tu3.png content/posts/2024-06-rice-slurry/tu3.png
```

- [ ] **Step 2: Write full migrated article**

Replace `content/posts/2024-06-rice-slurry/index.md` with:

```markdown
---
title: "猪粪沼液还田：水稻增产提质实战指南"
subtitle: "打通种养循环，让化肥钱留在自己口袋里"
date: 2024-06-15
author: "华中农业大学土壤健康与绿色农业团队"
categories: ["水稻", "土壤改良"]
tags: ["沼液还田", "增产", "田间试验", "水稻"]
featured: true
Toc: true
source: "植物营养与肥料学报 2023, 29(3): 483-495"
understanding:
  - "适用作物：水稻"
  - "适用土壤：水稻土（长江中下游典型水稻土）"
  - "沼液类型：生猪养殖场粪污厌氧发酵沼液"
  - "施用次数：每季共 2 次"
  - "施用时机：6月插秧/分蘖期、9月抽穗/灌浆期"
  - "单次用量：约 20 吨/亩（纯氮约 8 公斤/亩）"
---

很多老乡和农技员都在问：**不用化肥，全靠猪粪发酵的沼液，水稻能长好吗？土壤会不会越种越坏？**

为了验证这个问题，科研团队在浙江湖州长兴进行了长达 **3年** 的真实田间试验。用详实的数据告诉你：沼液不仅能当化肥，而且效果更好！

## 核心试验数据：真金不怕火炼

口说无凭，我们直接看连续3年记录的真实对比数据：

### 1. 产量与大米品质对比

老乡最关心的是"打多少粮"和"好不好吃"。

| 施肥方式 | 水稻产量 (kg/hm²) | 折合亩产 | 蛋白质含量 (g/kg) |
| :--- | :---: | :---: | :---: |
| **全用化肥 (对照组)** | 7800 | 约 520 公斤/亩 | 58.67 |
| **施用沼液 1年** | 9669 | 约 644 公斤/亩 | 71.00 |
| **施用沼液 2年** | 9765 | 约 651 公斤/亩 | 73.11 |
| **施用沼液 3年** | **9823** | **约 655 公斤/亩** | **73.31** |

> 💡 **结论总结：** 连续施用3年沼液，比全用化肥增产显著，大米蛋白质含量大幅提升，且口感完全不受影响！

### 2. 土壤肥力与微生物变化（越种越肥）

长期用化肥容易导致土壤板结，那么沼液呢？

| 施肥方式 | 有机质 (g/kg) | 速效钾 (mg/kg) | 结论 |
| :--- | :---: | :---: | :--- |
| **全用化肥 (对照)** | 13.83 | 96.55 | 土壤养分一般 |
| **施用沼液 3年** | **22.01** | **276.91** | **有机质提升近60%，速效钾翻两倍多！** |

专家还对土壤里的微生物进行了 DNA 测序。结果显示，连用3年后，土壤里的优势有益菌群（如变形菌门，能帮植物吸收养分）比例显著增加！

![土壤有益菌群结构图](tu2.png)

## 一线实战指导：到底该怎么泼？

想要达到专家的增产效果，绝不是随便乱泼的，建议农技人员指导老乡严格参考以下方案：

### 田间操作要点

- **🎯 把准时机**：水稻生长期最关键。试验中每年施用 **2次**。
    - **6月**（插秧 / 分蘖期）：打好底子。
    - **9月**（抽穗 / 灌浆期）：补充营养。
- **⚖️ 控制用量**：单次施用量约为每亩 **20吨**。
    - *说明：沼液绝大部分是水。这20吨里含有的总氮量，刚好和常规化肥的投入量相当（氮投入量约 122.2 kg/hm²），不用担心烧苗。*

## 常见"疑难杂症"解答

<details>
<summary><strong>🔴 痛点一：地会不会越泼越酸？</strong></summary>

<p><strong>专家答：别慌，这是正常过渡期！</strong></p>
<p>测定数据显示，<strong>第一年</strong>土壤酸碱度(pH)不变（5.74）；<strong>第二年</strong>确实会微降变酸（5.57）；<strong>但是到了第三年</strong>，土壤的自我调节机制启动，pH值完全恢复正常（5.83）。只要坚持科学施用，沼液不会导致土壤酸化，反而会让土壤维持高水平有机质，越来越松软。</p>
</details>

<details>
<summary><strong>🔴 痛点二：会不会光长叶子不结穗（贪青晚熟）？</strong></summary>

<p><strong>专家答：严格控量就不会！</strong></p>
<p>沼液里的"铵态氮"含量极高（占全氮92.99%），属于速效养分，水稻吸收极快。只要严格按照<strong>单次亩用20吨</strong>的标准，它的纯氮投入量和化肥对照田是一模一样的。不仅不会贪青，反而能促进谷粒饱满，蛋白质和钾含量显著提高。</p>
</details>

<details>
<summary><strong>🔴 痛点三：重金属会不会超标，大米还能吃吗？</strong></summary>

<p><strong>专家答：源头把控是关键！</strong></p>
<p>本次试验提取的沼液，铅(0.03mg/L)、镉(0.002mg/L)、铬(0.50mg/L)等均远远低于国家安全标准，没有检测到砷和汞。在实际推广中，一定要叮嘱老乡：务必使用<strong>规范化养猪场</strong>（不乱用重金属添加剂）且经过充分厌氧发酵的沼液，安全完全有保障。</p>
</details>

<details>
<summary><strong>🔴 痛点四：病菌会不会太多导致水稻生病？</strong></summary>

<p><strong>专家答：有实测数据铁证，土壤能自我恢复！</strong></p>
<p>猪粪经过沼气池的充分"厌氧发酵"后，绝大多数病原菌已经被杀死。虽然施入田里初期会打破原来的生态，但土壤的自我修复能力极强！</p>
<p>施用沼液第3年时，土壤微生物的多样性（香浓指数等）已经完全恢复到了和没施沼液前一样健康、稳定的水平！长期用不仅不生病，反而能提高土壤微生态环境的稳定性。</p>

![土壤微生物群落变化趋势](tu3.png)
</details>
```

- [ ] **Step 3: Verify migrated content renders**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo server -D
```

Open `http://localhost:1313/posts/2024-06-rice-slurry/`. Verify:
- All 4 tables render correctly
- Images display (tu2.png, tu3.png)
- FAQ sections expand/collapse
- Understanding card shows all 6 items
- Source citation at bottom

- [ ] **Step 4: Commit**

```bash
git add content/posts/2024-06-rice-slurry/
git commit -m "content: migrate first article from Quarto to Hugo"
```

---

### Task 10: Set Up GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write GitHub Actions workflow**

```yaml
name: Deploy Hugo Site

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.136.5
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i ${{ runner.temp }}/hugo.deb

      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v5

      - name: Build with Hugo
        env:
          HUGO_CACHEDIR: ${{ runner.temp }}/hugo_cache
          HUGO_ENVIRONMENT: production
        run: |
          hugo \
            --gc \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify workflow syntax**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
cat .github/workflows/deploy.yml | head -5
```

Expected: YAML content displays without errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Actions workflow for Hugo deployment"
```

---

### Task 11: Final Build Test and Cleanup

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update .gitignore**

```
# Hugo
public/
resources/_gen/
.hugo_build.lock

# OS
.DS_Store

# Superpowers
.superpowers/
```

- [ ] **Step 2: Run full Hugo build**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo --gc --minify 2>&1
```

Expected: Build succeeds, `public/` directory created with all pages.

- [ ] **Step 3: Verify all pages in output**

Run:
```bash
ls public/
ls public/posts/2024-06-rice-slurry/
ls public/tools/
ls public/about/
```

Expected: All pages exist in output.

- [ ] **Step 4: Start local server for final review**

Run:
```bash
cd /Users/gaoch/GitHub/SyntheticCommunity/biogas-flyer
hugo server -D
```

Review checklist:
- [ ] Homepage: hero banner, featured post, post list
- [ ] Article page: header, understanding card, tables, images, FAQ, floating TOC
- [ ] About page: team info displays
- [ ] Tools page: calculator works, standards table renders
- [ ] Mobile: responsive layout, no horizontal scroll
- [ ] Navigation: menu links work

- [ ] **Step 5: Final commit**

```bash
git add .gitignore
git commit -m "chore: update gitignore and final cleanup"
```

---

## Post-Deployment Steps (Manual)

After first push to GitHub:

1. Go to repo Settings → Pages → Source: "GitHub Actions"
2. Verify Actions workflow runs successfully
3. Site will be available at `https://<username>.github.io/biogas-flyer/`
4. Set up webhook to `gas.bio-spring.top` server for Chinese users
