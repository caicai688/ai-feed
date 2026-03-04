# AI 信息聚合

[![CI/CD](https://github.com/caicai688/ai-feed/actions/workflows/ci.yml/badge.svg)](https://github.com/caicai688/ai-feed/actions/workflows/ci.yml)
[![CodeQL](https://github.com/caicai688/ai-feed/actions/workflows/codeql.yml/badge.svg)](https://github.com/caicai688/ai-feed/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/caicai688/ai-feed)

实时聚合 AI 领域顶级信源的最新资讯

[在线演示](https://ai-feed-ten.vercel.app) | [问题反馈](https://github.com/caicai688/ai-feed/issues) | [贡献指南](./CONTRIBUTING.md)

## ✨ 功能特性

### 核心功能
- 📰 聚合 10+ AI 领域权威RSS信源
- ▶️ 监控 5 个顶级 AI YouTube 频道（支持字幕文稿）
- 🐦 追踪 8 位 AI 领域关键人物的 X/Twitter 动态
- ⚙️ **前端动态管理信源**（可自由添加/编辑/删除 YouTube 频道和 Twitter 账号）
- 🌐 AI 翻译中文版本（一键切换中英文）
- 📊 按信源和标签智能筛选
- 📈 每日 AI 动态总结和重点推荐

### 技术特性
- ⚡ Next.js 15 + TypeScript + Tailwind CSS
- 🚀 一键部署到 Vercel
- 🤖 GitHub Actions 自动化 CI/CD
- 🔒 CodeQL 安全扫描
- 📦 依赖自动审查
- 🎨 现代化响应式 UI

[查看详细功能说明 →](./FEATURES.md)

## 📡 数据源

### RSS 信源（10个）
- Anthropic Blog、OpenAI Blog
- MIT Technology Review AI
- The Rundown AI、TLDR AI
- Hugging Face Blog、Google AI Blog
- Meta AI Blog、DeepMind Blog
- Towards Data Science

### YouTube 频道（5个）
- OpenAI、Anthropic、Google DeepMind
- Lex Fridman Podcast
- Two Minute Papers

### X/Twitter 账号（8个）
- Sam Altman、Dario Amodei、Yann LeCun
- Andrew Ng、Greg Brockman
- Andrej Karpathy、Ilya Sutskever
- Demis Hassabis

## 🚀 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/ai-feed.git
cd ai-feed

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit

# 构建测试
npm run build
```

## 🔄 CI/CD 流程

本项目配置了完整的 CI/CD 流程：

### 自动化检查（每次 Push/PR）
- ✅ ESLint 代码规范检查
- ✅ TypeScript 类型检查
- ✅ 构建测试
- ✅ CodeQL 安全扫描
- ✅ 依赖审查

### 自动化部署
- 🚀 Push 到 `main` 分支自动部署到生产环境
- 🔍 PR 自动创建预览环境
- 💬 部署成功后自动评论 URL

## 📦 部署到 Vercel

### 方式 1：通过 GitHub（推荐）

1. Fork 本仓库
2. 访问 [Vercel](https://vercel.com)
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 点击 "Deploy"

**配置 GitHub Secrets（可选，用于 Actions 自动部署）：**

在仓库的 Settings → Secrets and variables → Actions 中添加：

- `VERCEL_TOKEN`: Vercel Token ([获取地址](https://vercel.com/account/tokens))
- `VERCEL_ORG_ID`: 组织 ID（在 Vercel 项目设置中查看）
- `VERCEL_PROJECT_ID`: 项目 ID（在 Vercel 项目设置中查看）

### 方式 2：Vercel CLI

```bash
npm i -g vercel
vercel
```

### 方式 3：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-feed)

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据源**: RSS Parser, YouTube RSS, Nitter
- **翻译**: MyMemory Translation API
- **字幕**: youtube-transcript
- **部署**: Vercel
- **CI/CD**: GitHub Actions

## API 端点

- `GET /api/collect` - 抓取所有信源的最新资讯
- `GET /api/youtube` - YouTube 频道视频数据
- `GET /api/twitter` - X/Twitter 账号动态
- `GET /api/daily-summary` - 每日 AI 动态总结
- `POST /api/translate` - 翻译服务（中英文）

## 📁 项目结构

```
ai-feed/
├── .github/
│   ├── workflows/          # GitHub Actions
│   │   ├── ci.yml         # 主 CI/CD 流程
│   │   ├── preview.yml    # PR 预览部署
│   │   ├── codeql.yml     # 安全扫描
│   │   └── dependency-review.yml
│   ├── ISSUE_TEMPLATE/    # Issue 模板
│   └── pull_request_template.md
├── app/
│   ├── api/
│   │   ├── collect/       # RSS 抓取 API
│   │   ├── youtube/       # YouTube 数据 API
│   │   ├── twitter/       # Twitter 数据 API
│   │   ├── translate/     # 翻译 API
│   │   ├── daily-summary/ # 每日总结 API
│   │   └── social-sources/# 社交媒体源管理 API
│   ├── manage/
│   │   └── page.tsx       # 信源管理页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   └── globals.css        # 全局样式
├── lib/
│   ├── sources.ts         # RSS 源配置
│   └── social-sources.ts  # YouTube/Twitter 默认配置
├── public/                # 静态资源
├── CONTRIBUTING.md        # 贡献指南
├── FEATURES.md            # 功能详细说明
├── CHANGELOG.md           # 变更日志
├── LICENSE                # MIT 许可证
├── vercel.json            # Vercel 配置
└── package.json
```

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)。

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [rss-parser](https://github.com/rbren/rss-parser) - RSS 解析库
- 所有 AI 信源提供者
